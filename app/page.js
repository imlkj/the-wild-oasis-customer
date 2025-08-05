import Link from "next/link";
import React from "react";

export default function Page() {
  return (
    <div>
      <h1>The Wild Oasis. Welcome to paradise</h1>
      <h3>
        <Link href="/cabins">Explore luxury cabins</Link>
      </h3>
    </div>
  );
}
