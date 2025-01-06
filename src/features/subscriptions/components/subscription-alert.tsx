"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { useFailModal } from "@/features/subscriptions/store/useFailModal";
import { useSuccessModal } from "@/features/subscriptions/store/useSuccessModal";

export const SubscriptionAlert = () => {
	const params = useSearchParams();

	const { onOpen: onOpenFail } = useFailModal();
	const { onOpen: onOpenSuccess } = useSuccessModal();

	const canceled = params.get("canceled");
	const success = params.get("success");

	useEffect(() => {
		if (canceled) {
			onOpenFail();
		}

		if (success) {
			onOpenSuccess();
		}
	}, [canceled, onOpenFail, success, onOpenSuccess]);

	return null;
};
