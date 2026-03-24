'use client';

import Image from 'next/image';

export default function Logo() {
  return <Image src={'/logo.png'} alt="logo" width={42} height={42} />;
}
