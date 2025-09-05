import briefcase from "@/assets/images/footer/briefcase.png";
import globe from "@/assets/images/footer/globe.png";
import mail from "@/assets/images/footer/mail.png";
import cns from "@/assets/images/partners/cns.png";
import hashLockAudit from "@/assets/images/partners/hashlock.png";
import onramp from "@/assets/images/partners/onramp.png";
import quillAudits from "@/assets/images/partners/quillaudits.png";
import discord from "@/assets/images/socials/discord.png";
import linkedin from "@/assets/images/socials/linkedin.png";
import telegram from "@/assets/images/socials/telegram.png";
import twitter from "@/assets/images/socials/twitter.png";
import VersionChecker from "../shared/version-checker";
import { Button } from "../ui/button";
import { useLocation } from "react-router-dom";
import useBreakpoint from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
// import footerBg from "@/assets/images/footer/footer-bg.svg";
import { Link as RouterLink } from "react-router-dom";
import Icon from "../icon";

const Box = ({ children }: { children: React.ReactNode }) => {
  const { isSm } = useBreakpoint();
  return (
    <div
      className={cn(
        "flex flex-1 p-px rounded-xl mx-auto bg-gradient-to-b from-[#FFDFD5CC] to-[#FFFFFF00] hover:opacity-80 transition-all duration-300",
        !isSm && "w-full"
      )}
    >
      <div className="rounded-xl w-full flex-1 flex flex-col items-center p-6 max-md:p-4 bg-[#171717]">
        {children}
      </div>
    </div>
  );
};

const Navigation = () => {
  return (
    <div className="max-md:mt-4">
      <div className="text-white font-bold text-base">Navigation</div>
      <div className="text-white/70 text-sm mt-4 font-sans text-right max-md:text-left hover:opacity-80 transition-all duration-300">
        <div className="mb-2">
          <Link href="https://docs.nodo.xyz">Docs</Link>
        </div>
        <div>
          <Link href="mailto:support@nodo.xyz">Contact</Link>
        </div>
      </div>
    </div>
  );
};

const Link = ({
  children,
  href,
  target = "_blank",
}: {
  children: React.ReactNode;
  href: string;
  target?: string;
}) => {
  return (
    <a
      href={href}
      className="text-white/70 text-sm font-sans hover:text-white"
      target={target}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

export function AppFooter() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { isMd } = useBreakpoint();

  return (
    <footer
      className={`${isHome ? `${isMd ? "mt-[100px]" : "mt-[8px]"}` : ""}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(255, 232, 201, 0.08) 0%, rgba(249, 244, 233, 0.08) 25%, rgba(227, 246, 255, 0.08) 60%, rgba(201, 212, 255, 0.08) 100%)",
      }}
    >
      <div className="max-w-[var(--layout-desktop-breakpoint-xl)] mx-auto px-9 pt-9 max-md:px-5 max-md:pt-10 relative z-10">
        <div className="flex justify-between ">
          <div>
            <img src="/nodo-logo-tm.png" className="h-[48px] mb-5" />
            <div className="font-light text-white/70 max-w-[654px] font-sans text-sm">
              NODO is a yield infrastructure protocol delivering autonomous,
              AI-powered liquidity provisioning to DeFi. It operates intelligent
              vaults on-chain that actively manage LP positions in real time,
              maximizing capital efficiency, minimizing impermanent loss, and
              capturing trading fees across top decentralized exchanges.
            </div>
            {!isMd && <Navigation />}
            <div className="flex max-md:flex-col gap-6 font-mono text-xs mt-6">
              <div>
                <div className="mb-3 max-md:mb-2 max-md:text-xs">
                  Audited by
                </div>
                <div className="rounded-lg px-4 max-md:px-3 max-md:py-2 py-3 bg-white/15 flex items-center gap-4 h-[40px] max-md:w-fit">
                  <img src={quillAudits} className="h-[20px] max-md:h-[14px]" />
                  <img
                    src={hashLockAudit}
                    className="h-[20px] max-md:h-[14px]"
                  />
                </div>
              </div>
              <div>
                <div className="mb-3 max-md:mb-2 max-md:text-xs">
                  Strategic Integration Partners
                </div>
                <div className="rounded-lg px-4 py-3 bg-white/15 flex items-center gap-4 h-[40px] w-fit">
                  <img
                    src={onramp}
                    className="h-[30px] max-md:h-[20px] object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          {isMd && <Navigation />}
        </div>
        <div
          className={cn(
            "flex gap-6 mt-11 mb-12",
            !isMd && "flex-col mt-6 gap-4"
          )}
        >
          <Box>
            <img src={globe} className="h-[48px]" />
            <div className="font-semibold text-white mt-4">Follow Us</div>
            <div className="flex gap-4 mt-4">
              <img
                src={discord}
                className="h-[36px] opacity-50 cursor-pointer hover:opacity-100 transition-all duration-300"
                onClick={() => {
                  window.open(
                    "https://discord.com/invite/eNfhEwz5bE",
                    "_blank"
                  );
                }}
              />
              <img
                src={twitter}
                className="h-[36px] opacity-50 cursor-pointer hover:opacity-100 transition-all duration-300"
                onClick={() => {
                  window.open("https://twitter.com/Official_NODO", "_blank");
                }}
              />
              <img
                src={telegram}
                className="h-[36px] opacity-50 cursor-pointer hover:opacity-100 transition-all duration-300"
                onClick={() => {
                  window.open("https://t.me/Official_NODO_Community", "_blank");
                }}
              />
              <img
                src={linkedin}
                className="h-[36px] opacity-50 cursor-pointer hover:opacity-100 transition-all duration-300"
                onClick={() => {
                  window.open(
                    "https://www.linkedin.com/company/nodo-official/",
                    "_blank"
                  );
                }}
              />
            </div>
          </Box>
          <Box>
            <img src={mail} className="h-[48px]" />
            <div className="font-semibold text-white mb-4 mt-4">
              For customer support queries
            </div>
            <Button
              asChild
              onClick={() => {
                window.open(
                  "https://nodoxyz.zendesk.com/hc/en-us/requests/new",
                  "_blank"
                );
              }}
              className="cursor-pointer"
            >
              <div className="rounded-lg border border-[#FFE8C9] px-6 py-2 hover:bg-white/10">
                Contact Support
              </div>
            </Button>
          </Box>
          <Box>
            <img src={briefcase} className="h-[48px]" />
            <div className="font-semibold text-white mb-4 mt-4">
              For partnership queries
            </div>
            <Button
              asChild
              onClick={() => {
                window.open("https://calendly.com/nodoxyz", "_blank");
              }}
              className="cursor-pointer"
            >
              <div className="rounded-lg border border-[#FFE8C9] px-6 py-2 hover:bg-white/10">
                Get in Touch
              </div>
            </Button>
          </Box>
        </div>
      </div>

      <div className="border-t border-white/10 bg-transparent font-sans md:italic flex text-sm">
        <div className="max-w-[var(--layout-desktop-breakpoint-xl)] mx-auto w-full px-9 py-4">
          <div className="flex max-md:flex-col max-md:items-center justify-between text-white/70">
            <div className="flex items-center">
              <span className="max-md:mr-6">
                ©{currentYear} NODO. All rights reserved
              </span>
            </div>
            {isMd && <VersionChecker />}
          </div>
        </div>
      </div>

      {!isHome && (
        <div className="md:hidden">
          <RouterLink
            to={"/"}
            className={`flex items-center justify-center gap-2 p-4 pb-5 transition-colors duration-200 bg-white/10 text-white`}
          >
            <Icon name={"Vault"} className="h-5" color="currentColor" />

            <span className="font-medium text-sm">Vaults</span>
          </RouterLink>
        </div>
      )}
    </footer>
  );
}
