import { getAuthUser } from '../../utils/auth';
import { ok } from '../../utils/response';

export default defineEventHandler((event) => {
  const user = getAuthUser(event);
  return ok({ email: user.email });
});
