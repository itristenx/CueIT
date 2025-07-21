import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { KnowledgeBaseModule } from './knowledge-base/knowledge-base.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { RolesModule } from './roles/roles.module';
import { KioskModule } from './kiosk/kiosk.module';
import { AssetsModule } from './assets/assets.module';
import { FeedbackModule } from './feedback/feedback.module';
import { SecurityModule } from './security/security.module';
import { ServerModule } from './server/server.module';
import { EmailModule } from './email/email.module';
import { DirectoryModule } from './directory/directory.module';
import { SsoModule } from './sso/sso.module';
import { ScimModule } from './scim/scim.module';
import { AdminPasswordModule } from './admin-password/admin-password.module';
import { RequestCatalogModule } from './request-catalog/request-catalog.module';
import { McpModule } from './mcp/mcp.module';
import { GamificationModule } from './gamification/gamification.module';
import { SlaModule } from './sla/sla.module';
import { WorkflowModule } from './workflow/workflow.module';
import { NovaAscendModule } from './nova-ascend/nova-ascend.module';
import { NovaHelixModule } from './nova-helix/nova-helix.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    TicketsModule,
    KnowledgeBaseModule,
    ConfigurationModule,
    NotificationsModule,
    IntegrationsModule,
    RolesModule,
    KioskModule,
    AssetsModule,
    FeedbackModule,
    SecurityModule,
    ServerModule,
    EmailModule,
    DirectoryModule,
    SsoModule,
    ScimModule,
    AdminPasswordModule,
    RequestCatalogModule,
    McpModule,
    GamificationModule,
    SlaModule,
    WorkflowModule,
    NovaAscendModule,
    NovaHelixModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
