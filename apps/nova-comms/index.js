/**
 * Nova Comms Slack Integration Service
 * 
 * This service provides Slack bot functionality for Nova Universe, allowing users to:
 * - Submit tickets via /nova-new command
 * - Interact with Cosmo AI assistant via /nova-cosmo
 * - View ticket statuses with /nova-status
 * - Check XP and leaderboards with /nova-xp and /nova-leaderboard
 * - Receive confirmations and status updates
 * 
 * Environment Variables Required:
 * - SLACK_SIGNING_SECRET: Slack app signing secret
 * - SLACK_BOT_TOKEN: Bot User OAuth token  
 * - API_URL: Nova Synth API base URL
 * - JWT_SECRET: Secret for JWT token generation
 * - JWT_EXPIRES_IN: JWT expiration time (default: 1h)
 * - VITE_ADMIN_URL: Nova Core panel URL for ticket links
 */

import dotenv from 'dotenv';
import { App } from '@slack/bolt';
import axios from 'axios';
import jwt from 'jsonwebtoken';

dotenv.config();

const PORT = process.env.SLACK_PORT || 3001;

// Validate required environment variables
const requiredEnvVars = [
  'SLACK_SIGNING_SECRET',
  'SLACK_BOT_TOKEN', 
  'API_URL',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
});

/**
 * Builds the modal for ticket submission
 */
function buildModal(systems = [], urgencies = [], channel) {
  const systemOptions = systems.map((s) => ({
    text: { type: 'plain_text', text: s },
    value: s,
  }));
  const urgencyOptions = urgencies.length
    ? urgencies.map((u) => ({
        text: { type: 'plain_text', text: u },
        value: u,
      }))
    : [
        { text: { type: 'plain_text', text: 'Urgent' }, value: 'urgent' },
        { text: { type: 'plain_text', text: 'High' }, value: 'high' },
        { text: { type: 'plain_text', text: 'Medium' }, value: 'medium' },
        { text: { type: 'plain_text', text: 'Low' }, value: 'low' },
      ];

  return {
    type: 'modal',
    callback_id: 'ticket_submit',
    private_metadata: channel || '',
    title: { type: 'plain_text', text: 'New Nova Ticket' },
    submit: { type: 'plain_text', text: 'Submit' },
    close: { type: 'plain_text', text: 'Cancel' },
    blocks: [
      {
        type: 'input',
        block_id: 'name',
        label: { type: 'plain_text', text: 'Your Name' },
        element: { 
          type: 'plain_text_input', 
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Enter your full name' }
        },
      },
      {
        type: 'input',
        block_id: 'email',
        label: { type: 'plain_text', text: 'Your Email' },
        element: { 
          type: 'plain_text_input', 
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Enter your email address' }
        },
      },
      {
        type: 'input',
        block_id: 'title',
        label: { type: 'plain_text', text: 'Issue Title' },
        element: { 
          type: 'plain_text_input', 
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Brief description of the issue' }
        },
      },
      {
        type: 'input',
        block_id: 'system',
        label: { type: 'plain_text', text: 'System/Application' },
        element: systemOptions.length > 0
          ? {
              type: 'static_select',
              action_id: 'value',
              options: systemOptions,
              placeholder: { type: 'plain_text', text: 'Select system' }
            }
          : { 
              type: 'plain_text_input', 
              action_id: 'value',
              placeholder: { type: 'plain_text', text: 'Enter system name' }
            },
      },
      {
        type: 'input',
        block_id: 'urgency',
        label: { type: 'plain_text', text: 'Urgency Level' },
        element: {
          type: 'static_select',
          action_id: 'value',
          options: urgencyOptions,
          placeholder: { type: 'plain_text', text: 'Select urgency' }
        },
      },
      {
        type: 'input',
        block_id: 'description',
        label: { type: 'plain_text', text: 'Description' },
        element: {
          type: 'plain_text_input',
          multiline: true,
          action_id: 'value',
          placeholder: { type: 'plain_text', text: 'Detailed description of the issue' }
        },
        optional: true,
      },
    ],
  };
}

/**
 * Handle /new-ticket slash command
 */
app.command('/new-ticket', async ({ ack, body, client }) => {
  await ack();
  
  try {
    console.log('Fetching configuration for ticket modal...');
    
    const token = jwt.sign(
      { type: 'slack', userId: body.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    const res = await axios.get(`${process.env.API_URL}/api/v2/config`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    const configData = res.data.success ? res.data.data : res.data;
    const systems = Array.isArray(configData.systems)
      ? configData.systems
      : String(configData.systems || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
    
    const urgencies = Array.isArray(configData.urgencyLevels)
      ? configData.urgencyLevels
      : String(configData.urgencyLevels || '')
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);

    const view = buildModal(systems, urgencies, body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
    
  } catch (err) {
    console.error('Failed to fetch config:', err.message);
    console.error('Full error:', err.response?.data || err);
    
    // Fall back to default modal
    const view = buildModal([], [], body.channel_id);
    await client.views.open({ trigger_id: body.trigger_id, view });
  }
});

/**
 * Handle modal submission
 */
app.view('ticket_submit', async ({ ack, body, view, client }) => {
  await ack();

  const state = view.state.values;
  const payload = {
    title: state.title.value.value,
    description: state.description?.value?.value || '',
    system: state.system.value.selected_option?.value || state.system.value.value,
    urgency: state.urgency.value.selected_option?.value || 'medium',
    submitterName: state.name.value.value,
    submitterEmail: state.email.value.value,
    channel: 'slack',
    source: 'slack',
    status: 'open',
  };

  try {
    console.log('Submitting ticket via v2 API...');
    
    const token = jwt.sign(
      { type: 'slack', userId: body.user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    const res = await axios.post(
      `${process.env.API_URL}/api/v2/tickets`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const responseData = res.data.success ? res.data.data : res.data;
    const ticketId = responseData.id || responseData.ticketId;
    const adminUrl = process.env.VITE_ADMIN_URL;
    
    console.log(`Ticket created successfully: #${ticketId}`);
    
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:white_check_mark: Ticket *#${ticketId}* submitted successfully!\n\n*Title:* ${payload.title}\n*System:* ${payload.system}\n*Urgency:* ${payload.urgency}`,
        },
      },
    ];
    
    if (adminUrl) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `<${adminUrl}/tickets/${ticketId}|View Ticket> • <${adminUrl}|Open Nova Portal>`,
          },
        ],
      });
    }
    
    await client.chat.postEphemeral({
      channel: view.private_metadata || body.user.id,
      user: body.user.id,
      text: `Ticket #${ticketId} submitted successfully`,
      blocks,
    });
    
  } catch (err) {
    console.error('Failed to submit ticket:', err.message);
    console.error('Full error:', err.response?.data || err);
    
    await client.chat.postEphemeral({
      channel: view.private_metadata || body.user.id,
      user: body.user.id,
      text: ':x: Failed to submit ticket. Please try again or contact support.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: ':x: Failed to submit ticket. Please try again or contact support.\n\nError: ' + (err.response?.data?.message || err.message),
          },
        },
      ],
    });
  }
});

/**
 * Handle app mentions for help
 */
app.event('app_mention', async ({ event, client }) => {
  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: 'Hi! I can help you create tickets for IT support. Use the `/new-ticket` command to get started.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Hi! I can help you create tickets for IT support. Use the `/new-ticket` command to get started.',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Create Ticket',
              },
              style: 'primary',
              value: 'create_ticket',
              action_id: 'create_ticket_button',
            },
          ],
        },
      ],
    });
  } catch (err) {
    console.error('Failed to respond to app mention:', err);
  }
});

/**
 * Handle button clicks for creating tickets
 */
app.action('create_ticket_button', async ({ ack, body, client }) => {
  await ack();
  
  // Simulate slash command body for modal opening
  const slashCommandBody = {
    trigger_id: body.trigger_id,
    channel_id: body.channel.id,
    user_id: body.user.id,
  };
  
  await app.command('/new-ticket').handler({ 
    ack: async () => {}, 
    body: slashCommandBody, 
    client 
  });
});

/**
 * Error handler
 */
app.error(async (error) => {
  console.error('Nova Comms Slack App Error:', error);
});

// Start the app
(async () => {
  try {
    await app.start(PORT);
    console.log(`✅ Nova Comms Slack service running on port ${PORT}`);
    console.log(`🔗 API URL: ${process.env.API_URL}`);
    console.log(`📧 Admin URL: ${process.env.VITE_ADMIN_URL || 'Not configured'}`);
  } catch (error) {
    console.error('Failed to start Nova Comms Slack app:', error);
    process.exit(1);
  }
})();
