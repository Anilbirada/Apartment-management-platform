import { redirect } from 'next/navigation';

export default function RegisterPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const role = typeof searchParams.role === 'string' ? searchParams.role : '';
  const query = role ? `?mode=register&role=${encodeURIComponent(role)}` : '?mode=register';
  redirect(`/login${query}`);
}
