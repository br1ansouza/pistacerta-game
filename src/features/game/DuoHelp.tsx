import { HelpCircle } from '@untitledui/icons';
import { Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay } from 'react-aria-components';

const STEPS = [
  [
    'Um lê, o outro adivinha',
    'Quem lê fica com a tela e pode tocar em “Revelar” para ver a resposta.',
  ],
  [
    'Dê as pistas aos poucos',
    'Leia em voz alta. Se precisar, toque em “Próxima pista”. Menos pistas, mais pontos.',
  ],
  [
    'Marque o resultado',
    'Use “Acertei” ou “Errei” conforme a resposta de quem adivinhou. Na próxima rodada, vocês podem trocar de papel.',
  ],
];

export function DuoHelp() {
  return (
    <DialogTrigger>
      <Button className="text-sky-400 border-sky-400/30 hover:bg-sky-400/10 focus-visible:outline-sky-400 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2">
        <HelpCircle aria-hidden className="size-4" />
        Como jogar
      </Button>
      <ModalOverlay
        isDismissable
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      >
        <Modal className="border-sky-400/50 bg-ink-900 shadow-hard max-h-[90dvh] w-full max-w-md overflow-y-auto border-2 p-5 sm:p-6">
          <Dialog className="outline-none">
            <Heading slot="title" className="font-display text-chalk-100 text-lg font-bold">
              Como jogar em dupla
            </Heading>
            <ol className="my-5 flex flex-col gap-4">
              {STEPS.map(([title, description], index) => (
                <li key={title} className="flex gap-3">
                  <span
                    aria-hidden
                    className="border-sky-400/40 text-sky-400 font-display flex size-7 shrink-0 items-center justify-center border text-xs font-bold"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-chalk-100 text-sm font-semibold">{title}</p>
                    <p className="text-chalk-300 mt-1 text-sm leading-relaxed">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Button
              slot="close"
              className="border-sky-400 bg-sky-400/10 text-sky-400 font-display focus-visible:outline-sky-400 w-full cursor-pointer border-2 px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Entendi
            </Button>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
