import { apiClient } from '../../lib/api';

export default async function handler(req, res) {
  try {
    const response = await apiClient.get('/test');
    res.status(200).json({ data: response.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
