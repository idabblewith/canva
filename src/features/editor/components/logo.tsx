import React from "react";
import Link from "next/link";
import Image from "next/image";

const Logo = () => {
	return (
		<Link href="/">
			<div className="size-8 relative shrink-0">
				<Image
					src="/canva.svg"
					alt="Logo"
					fill
					className="shrink-0 hover:opacity-75 transition"
				/>
			</div>
		</Link>
	);
};

export default Logo;
