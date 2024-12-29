export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Log raw response for debugging
  console.log('Raw Payment Failure Response:', body);

  // Pass all response data to failure page without validation
  return sendRedirect(event, `/payment/failure?${new URLSearchParams(body).toString()}`)
})
