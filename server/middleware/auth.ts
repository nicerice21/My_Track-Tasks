import { createRemoteJWKSet, jwtVerify } from 'jose';

export default defineEventHandler(async (event) => {
  // API リクエストのみ認証
  if (!event.path.startsWith('/api/')) {
    return;
  }

  const config = useRuntimeConfig(event);
  const token = getHeader(event, 'cf-access-jwt-assertion') ?? getHeader(event, 'CF-Access-Jwt-Assertion');

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing Cloudflare Access token',
    });
  }

  const teamDomain = config.accessTeamDomain?.replace(/\/$/, '');
  const audience = config.accessAudience;

  if (!teamDomain || !audience) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Access configuration is missing',
    });
  }

  const issuer = teamDomain.startsWith('http') ? teamDomain : `https://${teamDomain}`;

  try {
    const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
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
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Cloudflare Access token',
    });
  }
});
