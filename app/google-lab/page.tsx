import { redirect } from 'next/navigation';

export default function GoogleLabRedirectPage() {
  redirect('/blog-lab?tab=google');
}
