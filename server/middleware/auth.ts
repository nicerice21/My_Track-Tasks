import { createRemoteJWKSet, jwtVerify } from 'jose';

export default defineEventHandler(async (event) => {
  // API リクエストのみ認証
  if (!event.path.startsWith('/api/')) {
    return;
  }

  const config = useRuntimeConfig(event);
  const token = getHeader(event, 'CF-Access-Jwt-Assertion');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing Cloudflare Access token',
    });
  }

  const teamDomain = config.accessTeamDomain;
  const audience = config.accessAudience;

  if (!teamDomain || !audience) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Access configuration is missing',
    });
  }

  try {
    const jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://${teamDomain}`,
      audience,
    });

    const email = payload.email as string | undefined;
    if (!email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Email not found in token',
      });
    }

    if (email !== config.allowedEmail) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
      });
    }

    event.context.user = { email };
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Cloudflare Access token',
    });
  }
});
