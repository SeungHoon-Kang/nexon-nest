import { Request, Response } from 'express';
import axios, { AxiosRequestConfig } from 'axios';

const AUTH_BASE_URL =
  process.env.AUTH_BASE_URL || 'http://localhost:3001/api/v1/auth';
export async function proxyToAuthService(
  req: Request,
  res: Response,
  endpoint: string,
) {
  console.log('proxyToAuthService called', {
    method: req.method,
    url: req.originalUrl,
  });

  console.log('Proxying request:', {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
  });
  const targetUrl = `${AUTH_BASE_URL}${endpoint}`;
  const headers = { ...req.headers };
  delete headers.host;
  delete headers['content-length'];

  const axiosConfig: AxiosRequestConfig = {
    method: req.method,
    url: targetUrl,
    headers,
    data: ['GET', 'DELETE'].includes(req.method.toUpperCase())
      ? undefined
      : req.body,
  };

  try {
    const response = await axios(axiosConfig);
    if (response.data) {
      const { _id, ...rest } = response.data as Record<string, unknown>;
      response.data = rest;
    }
    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(
      'proxyToAuthService error:',
      error.response?.data || error.message || error,
    );
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
