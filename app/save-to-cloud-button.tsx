"use client";

import { useActionState } from "react";
import { saveToCloud, type SaveToCloudState } from "./actions";

const initialState: SaveToCloudState = { error: null, success: null };

export default function SaveToCloudButton() {
  const [state, formAction, isPending] = useActionState(
    saveToCloud,
    initialState,
  );

  return (
    <form action={formAction} className="save-cloud-form">
      <button className="save-cloud-button" disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save to cloud"}
      </button>
      <p
        className="form-feedback"
        aria-live="polite"
        role={state.error ? "alert" : undefined}
      >
        {state.error ?? state.success ?? " "}
      </p>
    </form>
  );
}
