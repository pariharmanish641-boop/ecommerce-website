import Link from "next/link";

const values = [
  {
    number: "01",
    title: "Closer connections",
    description:
      "Find useful things offered by people and independent sellers in and around the Noida community.",
  },
  {
    number: "02",
    title: "Made for society life",
    description:
      "Keep discovery and hand-offs local, so finding something useful can feel simple and familiar.",
  },
  {
    number: "03",
    title: "A community in progress",
    description:
      "Nook is a starting point for neighbours to support local sellers and make more of what is nearby.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fffdf8] text-stone-900">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">
          About Nook Noida
        </p>
        <div className="mt-5 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            A marketplace that feels like it belongs
            <span className="text-emerald-900"> around the corner.</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            Nook Noida brings the neighbourhood marketplace online: a place to
            discover everyday finds from neighbours and local sellers, right
            here in our community.
          </p>
        </div>

        <div className="mt-12 rounded-3xl bg-emerald-950 p-7 text-emerald-50 sm:mt-16 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
            Local by nature
          </p>
          <p className="mt-4 max-w-3xl text-2xl font-semibold leading-relaxed sm:text-4xl">
            Less searching far away. More discovering what our own community
            has to offer.
          </p>
        </div>

        <div className="mt-14 grid gap-8 border-b border-stone-200 pb-14 sm:mt-20 sm:grid-cols-3 sm:gap-10">
          {values.map((value) => (
            <article key={value.number}>
              <p className="text-sm font-bold text-orange-700">{value.number}</p>
              <h2 className="mt-4 text-xl font-bold">{value.title}</h2>
              <p className="mt-3 leading-7 text-stone-600">
                {value.description}
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-col gap-5 pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Have a look around.
            </h2>
            <p className="mt-2 text-stone-600">
              Browse what is available in the neighbourhood marketplace.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-fit rounded-full bg-orange-700 px-6 py-3 font-semibold text-white transition hover:bg-orange-800"
          >
            Explore the marketplace
          </Link>
        </div>
      </section>
    </main>
  );
}
