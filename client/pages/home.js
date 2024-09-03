import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <h1>Welcome to AI Career Coach</h1>
      <Link href="/journal">
        <button>Work Journal</button>
      </Link>
      <Link href="/coach">
        <button>Coach</button>
      </Link>
    </div>
  );
}