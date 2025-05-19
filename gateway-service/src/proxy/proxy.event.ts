import { Request, Response } from 'express';
import { JwtUser } from '../types/jwt-user';
import axios, { AxiosRequestConfig } from 'axios';

export async function proxyToEventService(req: Request, res: Response) {
  const EVENT_BASE_URL =
    process.env.EVENT_BASE_URL || 'http://localhost:3002/api/v1';
  const targetUrl = `${EVENT_BASE_URL}${req.originalUrl}`;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];

  console.log('Proxying request:', {
    method: req.method,
    url: req.originalUrl,
    targetUrl,
    headers,
    body: req.body,
  });

  const user = req.user as JwtUser | undefined;
  if (user?.sub) {
    headers['x-user-id'] = user.sub;
  }

  const axiosConfig: AxiosRequestConfig = {
    method: req.method,
    url: targetUrl,
    headers,
  };

  if (!['GET', 'DELETE'].includes(req.method.toUpperCase())) {
    axiosConfig.data = req.body as Record<string, unknown>;
  }

  try {
    const response = await axios(axiosConfig);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Proxy error', error: error.message });
    }
  }
}
