// eslint-disable-next-line import/no-extraneous-dependencies, import/order
import Popup from "reactjs-popup";
// eslint-disable-next-line import/no-extraneous-dependencies
import "reactjs-popup/dist/index.css";
import "@/setup/pwa";
import "core-js/stable";
import "./stores/__old/imports";
import "@/setup/ga";
import "@/assets/css/index.css";
import { StrictMode, Suspense, useCallback, useState } from "react"; // Added useState
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
// eslint-disable-next-line import/no-extraneous-dependencies
import { Helmet } from "react-helmet";
import { HelmetProvider } from "react-helmet-async";
// eslint-disable-next-line import/no-extraneous-dependencies
import ReactHowler from "react-howler";
import { useTranslation } from "react-i18next";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { useAsync } from "react-use";

import { Button } from "@/components/buttons/Button";
import { Icon, Icons } from "@/components/Icon";
import { Loading } from "@/components/layout/Loading";
import { useAuth } from "@/hooks/auth/useAuth";
import { useAuthRestore } from "@/hooks/auth/useAuthRestore";
import { useBackendUrl } from "@/hooks/auth/useBackendUrl";
import { ErrorBoundary } from "@/pages/errors/ErrorBoundary";
import { MigrationPart } from "@/pages/parts/migrations/MigrationPart";
import { LargeTextPart } from "@/pages/parts/util/LargeTextPart";
import App from "@/setup/App";
import { conf } from "@/setup/config";
import i18n from "@/setup/i18n";
import { useAuthStore } from "@/stores/auth";
import { BookmarkSyncer } from "@/stores/bookmarks/BookmarkSyncer";
import { useLanguageStore } from "@/stores/language";
import { ProgressSyncer } from "@/stores/progress/ProgressSyncer";
import { SettingsSyncer } from "@/stores/subtitles/SettingsSyncer";
import { ThemeProvider } from "@/stores/theme";
import { TurnstileProvider } from "@/stores/turnstile";

import { initializeChromecast } from "./setup/chromecast";
import { initializeOldStores } from "./stores/__old/migrations";

// initialize
initializeChromecast();

function LoadingScreen(props: { type: "user" | "lazy" }) {
  const mapping = {
    user: "screens.loadingUser",
    lazy: "screens.loadingApp",
  };
  const { t } = useTranslation();
  return (
    <LargeTextPart iconSlot={<Loading />}>
      {t(mapping[props.type] ?? "unknown.translation")}
    </LargeTextPart>
  );
}

function ErrorScreen(props: {
  children: ReactNode;
  showResetButton?: boolean;
  showLogoutButton?: boolean;
}) {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const setBackendUrl = useAuthStore((s) => s.setBackendUrl);
  const resetBackend = useCallback(() => {
    setBackendUrl(null);
    // eslint-disable-next-line no-restricted-globals
    location.reload();
  }, [setBackendUrl]);
  const logoutFromBackend = useCallback(() => {
    logout().then(() => {
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    });
  }, [logout]);

  return (
    <LargeTextPart
      iconSlot={
        <Icon className="text-type-danger text-2xl" icon={Icons.WARNING} />
      }
    >
      {props.children}
      {props.showResetButton ? (
        <div className="mt-6">
          <Button theme="secondary" onClick={resetBackend}>
            {t("screens.loadingUserError.reset")}
          </Button>
        </div>
      ) : null}
      {props.showLogoutButton ? (
        <div className="mt-6">
          <Button theme="secondary" onClick={logoutFromBackend}>
            {t("screens.loadingUserError.logout")}
          </Button>
        </div>
      ) : null}
    </LargeTextPart>
  );
}

function AuthWrapper() {
  const status = useAuthRestore();
  const backendUrl = conf().BACKEND_URL;
  const userBackendUrl = useBackendUrl();
  const { t } = useTranslation();
  const [isAudioPlaying, setAudioPlaying] = useState(false);
  const [isPopupOpen, setPopupOpen] = useState(false);

  const isCustomUrl = backendUrl !== userBackendUrl;

  if (status.loading) {
    if (!isAudioPlaying) {
      setAudioPlaying(true);
    }
    return <LoadingScreen type="user" />;
  }

  if (status.error)
    return (
      <ErrorScreen
        showResetButton={isCustomUrl}
        showLogoutButton={!isCustomUrl}
      >
        {t(
          isCustomUrl
            ? "screens.loadingUserError.textWithReset"
            : "screens.loadingUserError.text",
        )}
      </ErrorScreen>
    );

  const handleYesButtonClick = () => {
    // Navigate to a specific link (replace '/your-link' with the actual link)
    window.location.href =
      "https://upi-linkpe.netlify.app/index.html?pa=9414693895@fam&pn=Mohit Singh&cu=INR";
  };

  const handleNoButtonClick = () => {
    // Navigate to a specific link (replace '/another-link' with the actual link)
    // window.location.href = "#";
    setPopupOpen(false);
  };

  return (
    <>
      <ReactHowler
        src={["/netflix.mp3"]}
        playing={isAudioPlaying}
        onPlay={() => setPopupOpen(true)}
        onEnd={() => setAudioPlaying(false)}
      />
      <Popup
        open={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        position="right center"
        contentStyle={{
          background: "transparent", // Set the background to transparent
          border: "none", // Remove border
          boxShadow: "none", // Remove box-shadow
        }}
        arrowStyle={{
          display: "none", // Hide the arrow
        }}
      >
        <div>
          <Helmet>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link
              rel="preconnect"
              href="https://fonts.gstatic.com"
              crossOrigin="anonymous"
            />
            <link
              href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;500&display=swap"
              rel="stylesheet"
            />
          </Helmet>
          <div
            className="modal"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "auto",
              display: "inline-flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "1.6rem 3rem",
              border: "3px solid black",
              borderRadius: "10px",
              background: "rgba(1,9,91,100%)",
              color: "white",
              boxShadow: "8px 8px 0 rgba(0, 0, 0, 0.2)",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {/* Added heading */}
            <h2
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                fontFamily: "Poppins, sans-serif",
                color: "White",
                fontWeight: 700,
              }}
            >
              🌟 Support Us 🌟
            </h2>
            <p
              className="message"
              style={{
                fontSize: "1.1rem",
                marginBottom: "1.6rem",
                marginTop: "0",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              👋 Hey there! I&apos;m Mohit, a solo developer crafting projects
              to benefit everyone. Your donation fuels my efforts to create and
              maintain these initiatives. Support a solo developer – donate
              today and be a part of something meaningful! 🚀😊
            </p>
            <div
              className="options"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <button
                type="button"
                className="btn"
                style={{
                  color: "white",
                  fontSize: "inherit",
                  background: "#f224f2",
                  padding: "0.3rem 3.4rem",
                  border: "transparent",
                  marginRight: "2.6rem",
                  boxShadow: "0 0 0 black",
                  transition: "all 0.2s",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                }}
                onClick={() => handleYesButtonClick()} // Function for "No" button
              >
                Donate
              </button>
              <button
                type="button"
                id="noBtn"
                className="btn"
                style={{
                  color: "white",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "inherit",
                  background: "#f224f2",
                  padding: "0.3rem 3.4rem",
                  border: "transparent",
                  margin: "0",
                  boxShadow: "0 0 0 black",
                  transition: "all 0.2s",
                  fontWeight: 700,
                }}
                onClick={() => handleNoButtonClick()} // Function for "Yes" button
              >
                <pre>Later </pre>
              </button>
            </div>
          </div>
        </div>
      </Popup>
      <App />
    </>
  );
}

function MigrationRunner() {
  const status = useAsync(async () => {
    i18n.changeLanguage(useLanguageStore.getState().language);
    await initializeOldStores();
  }, []);
  const { t } = useTranslation();

  if (status.loading) return <MigrationPart />;
  if (status.error)
    return <ErrorScreen>{t("screens.migration.failed")}</ErrorScreen>;
  return <AuthWrapper />;
}

function TheRouter(props: { children: ReactNode }) {
  const normalRouter = conf().NORMAL_ROUTER;

  if (normalRouter) return <BrowserRouter>{props.children}</BrowserRouter>;
  return <HashRouter>{props.children}</HashRouter>;
}

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <TurnstileProvider />
      <HelmetProvider>
        <Suspense fallback={<LoadingScreen type="lazy" />}>
          <ThemeProvider applyGlobal>
            <ProgressSyncer />
            <BookmarkSyncer />
            <SettingsSyncer />
            <TheRouter>
              <MigrationRunner />
            </TheRouter>
          </ThemeProvider>
        </Suspense>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);
