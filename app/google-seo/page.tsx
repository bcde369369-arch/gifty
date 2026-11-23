import { redirect } from 'next/navigation';

export default function GoogleSeoRedirectPage() {
  redirect('/blog-lab?tab=google');
}
