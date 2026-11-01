import { createRemoteJWKSet, jwtVerify } from 'jose';

export default defineEventHandler(async (event) => {
  // API リクエストのみ認証
  if (!event.path.startsWith('/api/')) {
    return;
  }

  const config = useRuntimeConfig(event);

  // ローカル開発時: DEV_USER_EMAIL が設定されていれば認証をスキップする
  if (config.devUserEmail) {
    event.context.user = { email: config.devUserEmail };
    return;
  }

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

  // JWT 検証（失敗時のみ 401 に変換する）
  let payload;
  try {
    const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    ({ payload } = await jwtVerify(token, jwks, { issuer, audience }));
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid Cloudflare Access token',
    });
  }

  // 認可（メール一致）は検証とは別に扱い、403 を正しく返す
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
});
