import * as useFetch from '@/lib/fetch';

const baseUrl = "http://localhost:5000"

export async function teste(){
  const url = `${baseUrl}/drivers`
  const response = await useFetch.get(url, {})
  return response.json();
}