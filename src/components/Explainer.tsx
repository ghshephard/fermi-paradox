export function Explainer() {
  return (
    <section className="panel explainer">
      <h2>What am I looking at?</h2>
      <details open>
        <summary>The Fermi paradox</summary>
        <p>
          The galaxy holds hundreds of billions of stars, many billions of years older than the Sun.
          If even a small fraction produced technological civilizations, the sky should be full of
          them. Yet we see no one. Enrico Fermi's question was simple: <em>where is everybody?</em>
        </p>
      </details>
      <details>
        <summary>The Drake equation</summary>
        <p>
          Frank Drake broke the question into seven factors whose product, N, is the number of
          detectable civilizations in the Milky Way. Plugging in a single best guess for each factor
          usually gives N in the thousands or millions, which makes our empty sky look paradoxical.
        </p>
      </details>
      <details>
        <summary>Why uncertainty dissolves the paradox</summary>
        <p>
          Sandberg, Drexler and Ord argue that several factors, especially the chance that life
          arises at all, are uncertain across many orders of magnitude. Treating each factor as a
          range rather than a point and sampling the equation many times shows that a large share of
          plausible worlds contain no other civilizations. With their estimates, the probability that
          we are alone in the Milky Way is about 52%, and about 38% for the entire observable
          universe, even though the <em>average</em> N is 27 million.
        </p>
        <p>
          A toy example from the paper: nine factors each uniform on [0, 0.2] give a point estimate
          of 100 civilizations and a vanishing chance of an empty galaxy, yet sampling the factors
          produces an empty galaxy 21% of the time.
        </p>
      </details>
      <details>
        <summary>How this simulator works</summary>
        <p>
          In paper mode, each factor except f<sub>l</sub> is drawn log-uniformly from the range you
          set. f<sub>l</sub> = 1 − e<sup>−λVt</sup>, where λVt (expected abiogenesis events per
          habitable planet) is log-normal with the median and spread you choose; the paper uses a
          median of 1 and a spread of 50 orders of magnitude. Every change runs 200,000 samples in a
          background worker. &ldquo;Alone in the Milky Way&rdquo; is the share of samples with N &lt; 1,
          and &ldquo;alone in the observable universe&rdquo; is the share with N &lt; 10<sup>−10</sup>.
        </p>
        <p>
          In classic mode, N is a single product, and the probability of company follows a Poisson
          model: P(at least one other) = 1 − e<sup>−N</sup>.
        </p>
        <p>
          The paper goes further and updates these odds using the fact that we observe no one, which
          raises the chance of being alone in the galaxy to between 53% and 99.6%. This tool shows the
          prior, before that update.
        </p>
      </details>
      <p className="citation">
        Source: Anders Sandberg, Eric Drexler &amp; Toby Ord,{' '}
        <a href="https://arxiv.org/abs/1806.02404" target="_blank" rel="noreferrer">
          &ldquo;Dissolving the Fermi Paradox&rdquo; (2018), arXiv:1806.02404
        </a>
        .
      </p>
    </section>
  );
}
