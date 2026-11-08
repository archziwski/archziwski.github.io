import { Blocks, ShieldCheck, TextCursorInput, type LucideIcon } from "lucide-react";

export const site = {
  name: "Arch",
  github: "https://github.com/archziwski",
  githubHandle: "@archziwski",
  instagram: "https://www.instagram.com/archisdev/",
  instagramHandle: "@archisdev",
};

export interface Project {
  id: string;
  name: string;
  repo: string;
  url: string;
  desc: string;
  icon: LucideIcon;
  fallbackMeta: string;
}

export const projects: Project[] = [
  {
    id: "westfolia",
    name: "WestFolia",
    repo: "archziwski/WestFolia",
    url: "https://github.com/archziwski/WestFolia",
    desc: "Performans kazanmak için agresifçe optimize edilmiş Folia forku — bölgesel çoklu iş parçacıklı sunucu.",
    icon: Blocks,
    fallbackMeta: "Java · MIT",
  },
  {
    id: "tabelaapi",
    name: "TabelaAPI",
    repo: "archziwski/TabelaAPI",
    url: "https://github.com/archziwski/TabelaAPI",
    desc: "Oyunculara paketlerle geçici sanal tabela girişi açan, çok platformlu Java API'si ve eklentisi.",
    icon: TextCursorInput,
    fallbackMeta: "Java 21 · MIT",
  },
  {
    id: "captchaplus",
    name: "CaptchaPlus",
    repo: "archziwski/CaptchaPlus",
    url: "https://github.com/archziwski/CaptchaPlus",
    desc: "Botları durdurmak için oyuncuya kişisel CAPTCHA haritası veren Paper/Folia doğrulama eklentisi.",
    icon: ShieldCheck,
    fallbackMeta: "Java 21 · MIT",
  },
];
