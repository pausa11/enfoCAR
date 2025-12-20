import SplitText from "./SplitText";

export function Hero() {
  return (
    <div className="flex flex-col items-center w-full h-full">
      <SplitText
        text="enfoCAR"
        tag="h1"
        className="text-4xl lg:text-5xl font-bold text-center"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        rootMargin="-100px"
        textAlign="center"
      />
      <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center">
        Maneja tus naves y negocios sin tanto rollo.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
