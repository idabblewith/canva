"use client";

import Link from "next/link";
import { Loader, TriangleAlert } from "lucide-react";
// import { use } from "react";

import { useGetProject } from "@/features/projects/api/useGetProject";

import Editor from "@/features/editor/components/editor";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

// interface EditorProjectIdPageProps {
// params: {
// 	projectId: string;
// };
// params: Promise<{ projectId: string }>;
// }

// const EditorProjectIdPage = ({ params }: EditorProjectIdPageProps) => {
const EditorProjectIdPage = () => {
	// next 15/react 19 changes require react use() hook to prevent error
	// A param property was accessed directly with `params.projectId`. `params` is now a Promise and should be unwrapped with `React.use()` before accessing properties of the underlying params object. In this version of Next.js direct access to param properties is still supported to facilitate migration but in a future version you will be required to unwrap `params` with `React.use()`.
	// const p = use(params);
	// console.log(params);
	// const { data, isLoading, isError } = useGetProject(p.projectId);
	const params = useParams<{ projectId: string }>();
	console.log(params);

	const { data, isLoading, isError } = useGetProject(params.projectId);
	if (isLoading || !data) {
		return (
			<div className="h-full flex flex-col items-center justify-center">
				<Loader className="size-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (isError) {
		return (
			<div className="h-full flex flex-col gap-y-5 items-center justify-center">
				<TriangleAlert className="size-6 text-muted-foreground" />
				<p className="text-muted-foreground text-sm">
					Failed to fetch project
				</p>
				<Button asChild variant="secondary">
					<Link href="/">Back to Home</Link>
				</Button>
			</div>
		);
	}

	return <Editor initialData={data} />;
};

export default EditorProjectIdPage;
