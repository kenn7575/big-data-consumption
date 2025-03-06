import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

export const client = axios.create({ baseURL });

export const server = axios.create({ baseURL });
