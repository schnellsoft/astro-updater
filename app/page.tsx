import { getDogs } from "@/lib/dogs";
import Link from "next/link";
import { removeDog } from "./actions";
import AddDogForm from "./add-dog-form";
import SaveToCloudButton from "./save-to-cloud-button";

export default function Home() {
  const dogs = getDogs();

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Good Dog Index home">
          <span className="brand-mark" aria-hidden="true">
            G
          </span>
          <span>
            good dog <span className="brand-light">index</span>
          </span>
        </Link>
        <span className="database-status">
          <span /> Local directory
        </span>
      </header>

      <section className="page-heading" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">THE ROSTER</p>
          <h1 id="page-title">
            Every good dog,
            <br className="heading-break" /> in one place.
          </h1>
        </div>
        <p className="intro-copy">
          A thoughtful little directory for the dogs who make a house feel like
          home.
        </p>
      </section>

      <div className="workspace">
        <aside className="add-panel" aria-labelledby="add-title">
          <div className="section-heading">
            <span className="section-number">01</span>
            <h2 id="add-title">Add a dog</h2>
          </div>
          <AddDogForm />
          <p className="storage-note">
            Changes are saved to this directory and its JSON record.
          </p>
        </aside>

        <section className="directory" aria-labelledby="directory-title">
          <div className="directory-heading">
            <div className="section-heading">
              <span className="section-number">02</span>
              <h2 id="directory-title">The dogs</h2>
            </div>
            <SaveToCloudButton />
            <span className="dog-count">
              <strong>{dogs.length.toString().padStart(2, "0")}</strong> listed
            </span>
          </div>

          {dogs.length === 0 ? (
            <p className="empty-state">
              No dogs yet. Add the first one to start the directory.
            </p>
          ) : (
            <ul className="dog-list">
              {dogs.map((dog, index) => (
                <li className="dog-row" key={dog.id}>
                  <span
                    className={`dog-avatar tone-${index % 5}`}
                    aria-hidden="true"
                  >
                    {dog.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="dog-copy">
                    <div className="dog-title-line">
                      <h3>{dog.name}</h3>
                      <span className="dog-age">
                        {dog.age} {dog.age === 1 ? "year" : "years"}
                      </span>
                    </div>
                    <p className="dog-breed">{dog.race}</p>
                    <p className="dog-health">{dog.health}</p>
                    <details className="dog-details">
                      <summary>Read profile</summary>
                      <p>{dog.details}</p>
                    </details>
                  </div>
                  <form action={removeDog}>
                    <input type="hidden" name="id" value={dog.id} />
                    <button
                      className="remove-button"
                      type="submit"
                      aria-label={`Remove ${dog.name}`}
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
