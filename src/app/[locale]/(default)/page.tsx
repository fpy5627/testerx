import Feature from "@/components/blocks/feature";
import { getLandingPage } from "@/services/page";

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = await getLandingPage(locale);

  return <>{page.feature && <Feature section={page.feature} />}</>;
}
