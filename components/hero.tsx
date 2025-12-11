export function Hero() {
  return (
    <div className="flex flex-col items-center w-full h-full">
      <h1 className="text-4xl lg:text-5xl font-bold text-center">enfoCAR</h1>
      <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center">
        Maneja tus naves y negocios sin tanto rollo.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
