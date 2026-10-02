"use client";

import { useActionState } from "react";
import { addDog, type DogFormState } from "./actions";

const initialState: DogFormState = { error: null, success: null, resetKey: 0 };

export default function AddDogForm() {
  const [state, formAction, isPending] = useActionState(addDog, initialState);

  return (
    <form className="add-form" key={state.resetKey} action={formAction}>
      <label>
        <span>Name</span>
        <input
          autoComplete="off"
          maxLength={80}
          name="name"
          placeholder="e.g. Luna"
          required
        />
      </label>
      <div className="form-pair">
        <label>
          <span>Age</span>
          <input
            min="0"
            max="40"
            name="age"
            placeholder="Years"
            required
            type="number"
          />
        </label>
        <label>
          <span>Breed</span>
          <input
            maxLength={100}
            name="race"
            placeholder="e.g. Labrador"
            required
          />
        </label>
      </div>
      <label>
        <span>Health</span>
        <input
          maxLength={300}
          name="health"
          placeholder="A short health note"
          required
        />
      </label>
      <label>
        <span>About</span>
        <textarea
          maxLength={2000}
          name="details"
          placeholder="A few words about their personality"
          required
          rows={4}
        />
      </label>
      <button className="add-button" disabled={isPending} type="submit">
        <span aria-hidden="true">+</span>{" "}
        {isPending ? "Adding dog..." : "Add to directory"}
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
