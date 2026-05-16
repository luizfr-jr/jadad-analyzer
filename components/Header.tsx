export default function Header() {
  return (
    <header className="bg-green-900 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-2xl font-black tracking-tight">J</span>
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">Analisador Jadad</h1>
          <p className="text-green-300 text-sm">
            Avaliação da Qualidade Metodológica de Ensaios Clínicos Randomizados
          </p>
        </div>
        <div className="ml-auto hidden sm:block text-right">
          <span className="text-xs text-green-400 leading-tight block">Baseado em</span>
          <span className="text-xs text-green-300 font-medium">Jadad et al., 1996</span>
        </div>
      </div>
    </header>
  );
}
