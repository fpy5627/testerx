"use client";

import { Footer as FooterType } from "@/types/blocks/footer";
import Icon from "@/components/icon";
import { Link } from "@/i18n/navigation";

export default function Footer({ footer }: { footer: FooterType }) {
  if (footer.disabled) {
    return null;
  }

  return (
    <section id={footer.name} className="py-16 bg-white dark:bg-[#2b333e] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-8">
        <footer>
          <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
            <div className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
              {footer.brand && (
                <div>
                  <div className="flex items-center justify-center gap-2 lg:justify-start">
                    {footer.brand.logo && (
                      <img
                        src={footer.brand.logo.src}
                        alt={footer.brand.logo.alt || footer.brand.title}
                        className="h-11"
                      />
                    )}
                    {footer.brand.title && (
                      <p className="text-3xl font-semibold">
                        {footer.brand.title}
                      </p>
                    )}
                  </div>
                  {footer.brand.description && (
                    <p className="mt-6 text-md text-muted-foreground">
                      {footer.brand.description}
                    </p>
                  )}
                </div>
              )}
              {footer.social && (
                <ul className="flex items-center space-x-6 text-muted-foreground">
                  {footer.social.items?.map((item, i) => (
                    item.url && item.url.trim() ? (
                      <li key={i} className="font-medium hover:text-primary">
                        <a href={item.url.trim()} target={item.target || "_self"}>
                          {item.icon && (
                            <Icon name={item.icon} className="size-4" />
                          )}
                        </a>
                      </li>
                    ) : null
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-3 gap-6 lg:gap-20">
              {footer.nav?.items?.map((item, i) => (
                <div key={i}>
                  <p className="mb-6 font-bold">{item.title}</p>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    {item.children?.map((iitem, ii) => (
                      iitem.url && iitem.url.trim() ? (
                        <li key={ii} className="font-medium hover:text-primary">
                          <Link href={iitem.url.trim()} target={iitem.target || "_self"}>
                            {iitem.title}
                          </Link>
                        </li>
                      ) : (
                        <li key={ii} className="font-medium text-muted-foreground">
                          {iitem.title}
                        </li>
                      )
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t pt-8 text-center text-sm font-medium text-muted-foreground lg:flex-row lg:items-center lg:text-left">
            {footer.copyright && (
              <p>
                {footer.copyright}
                {process.env.NEXT_PUBLIC_SHOW_POWERED_BY === "false" ? null : (
                  <a
                    href="https://BDSM Test.ai"
                    target="_blank"
                    className="px-2 text-primary"
                  >
                    BDSM Test
                  </a>
                )}
              </p>
            )}

            {footer.agreement && (
              <ul className="flex justify-center gap-4 lg:justify-start">
                {footer.agreement.items?.map((item, i) => (
                  item.url && item.url.trim() ? (
                    <li key={i} className="hover:text-primary">
                      <Link href={item.url.trim() as any} target={item.target || "_self"}>
                        {item.title}
                      </Link>
                    </li>
                  ) : (
                    <li key={i} className="text-muted-foreground">
                      {item.title}
                    </li>
                  )
                ))}
              </ul>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
}
