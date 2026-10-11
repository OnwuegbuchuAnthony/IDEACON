package com.ideacon.app;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 4101;
    private static final int LOCATION_PERMISSION_REQUEST = 4102;
    private static final int NOTIFICATION_PERMISSION_REQUEST = 4103;
    private static final String SITE_HOST = "ideacon.vercel.app";
    private static final String NOTIFICATION_CHANNEL = "ideacon_updates";
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private GeolocationPermissions.Callback geoCallback;
    private String geoOrigin;
    private boolean showingOfflinePage = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();

        webView = new WebView(this);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setGeolocationEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setSupportMultipleWindows(false);
        settings.setMediaPlaybackRequiresUserGesture(true);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme() == null ? "" : uri.getScheme();
                String host = uri.getHost();
                if ("https".equalsIgnoreCase(scheme) && SITE_HOST.equalsIgnoreCase(host)
                        && (uri.getPort() == -1 || uri.getPort() == 443)) return false;
                if ("https".equalsIgnoreCase(scheme) || "mailto".equalsIgnoreCase(scheme)
                        || "tel".equalsIgnoreCase(scheme)) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (Exception ignored) { }
                }
                return true;
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                if (url != null && url.startsWith("https://" + SITE_HOST + "/")) showingOfflinePage = false;
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                if (url != null && url.startsWith("https://" + SITE_HOST + "/")) {
                    registerPushTokenWithWebsite();
                }
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame() && !showingOfflinePage) {
                    showingOfflinePage = true;
                    view.loadDataWithBaseURL("https://" + SITE_HOST + "/", offlineHtml(),
                        "text/html", "UTF-8", null);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                    FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception ex) {
                    filePathCallback = null;
                    Toast.makeText(MainActivity.this, "Unable to open file picker", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin,
                    GeolocationPermissions.Callback callback) {
                if (!origin.equals("https://" + SITE_HOST)) {
                    callback.invoke(origin, false, false);
                    return;
                }
                if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                        || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    callback.invoke(origin, true, false);
                } else {
                    geoOrigin = origin;
                    geoCallback = callback;
                    requestPermissions(new String[] {
                        Manifest.permission.ACCESS_FINE_LOCATION,
                        Manifest.permission.ACCESS_COARSE_LOCATION
                    }, LOCATION_PERMISSION_REQUEST);
                }
            }
        });

        requestNotificationPermission();
        registerPushTokenIfConfigured();
        String notificationUrl = safeNotificationUrl(getIntent());
        if (notificationUrl != null) {
            webView.loadUrl(notificationUrl);
        } else if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl("https://" + SITE_HOST + "/");
        }
    }

    private String safeNotificationUrl(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) return null;
        Uri uri = intent.getData();
        if (uri == null || !"https".equalsIgnoreCase(uri.getScheme())
                || !SITE_HOST.equalsIgnoreCase(uri.getHost())
                || (uri.getPort() != -1 && uri.getPort() != 443)) return null;
        return uri.toString();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String url = safeNotificationUrl(intent);
        if (url != null && webView != null) webView.loadUrl(url);
    }

    private void registerPushTokenWithWebsite() {
        String token = getSharedPreferences("ideacon", MODE_PRIVATE).getString("fcm_token", null);
        if (token == null || token.isEmpty() || webView == null) return;
        String quotedToken = org.json.JSONObject.quote(token);
        String script = "(function(){const token=" + quotedToken + ";" +
            "window.__ideaconPushToken=token;" +
            "window.dispatchEvent(new CustomEvent('ideacon:push-token',{detail:{token}}));" +
            "const register=async()=>{try{const r=await fetch('/api/push/register',{method:'POST',credentials:'same-origin'," +
            "headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});" +
            "if(!r.ok&&r.status!==401)console.warn('IDEACON push registration failed',r.status);" +
            "}catch(e){console.warn('IDEACON push registration unavailable');}};" +
            "window.__ideaconRegisterPush=register;window.addEventListener('popstate',register);" +
            "if(!window.__ideaconHistoryHooked){window.__ideaconHistoryHooked=true;" +
            "['pushState','replaceState'].forEach(k=>{const original=history[k];history[k]=function(){" +
            "const result=original.apply(this,arguments);setTimeout(()=>window.__ideaconRegisterPush&&window.__ideaconRegisterPush(),0);return result;};});}" +
            "register();})();";
        webView.evaluateJavascript(script, null);
    }

    private void registerPushTokenIfConfigured() {
        try {
            if (FirebaseApp.getApps(this).isEmpty()) return;
            FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
                if (task.isSuccessful() && task.getResult() != null) {
                    getSharedPreferences("ideacon", MODE_PRIVATE).edit()
                        .putString("fcm_token", task.getResult()).apply();
                    if (webView != null) {
                        String token = task.getResult().replace("\\", "\\\\").replace("'", "\\'");
                        webView.post(() -> webView.evaluateJavascript(
                            "window.dispatchEvent(new CustomEvent('ideacon:push-token',{detail:{token:'" + token + "'}}));",
                            null));
                    }
                }
            });
        } catch (IllegalStateException ignored) {
            // Firebase becomes active after google-services.json is added to the Android app.
        }
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS },
                NOTIFICATION_PERMISSION_REQUEST);
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                NOTIFICATION_CHANNEL, "IDEACON updates", NotificationManager.IMPORTANCE_DEFAULT);
            channel.setDescription("Updates about matches, reviews, and deals");
            channel.enableLights(true);
            channel.setLightColor(Color.rgb(14, 165, 233));
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }

    private String offlineHtml() {
        return "<!doctype html><html><head><meta name='viewport' content='width=device-width,initial-scale=1'>" +
            "<meta name='theme-color' content='#F6FAFF'><style>body{font-family:Arial,sans-serif;background:#F6FAFF;color:#10243e;display:grid;place-items:center;min-height:90vh;margin:0;padding:24px;text-align:center}main{max-width:360px}button{border:0;border-radius:28px;padding:14px 24px;background:#0EA5E9;color:white;font-weight:bold;font-size:16px}</style></head>" +
            "<body><main><h1>You're offline</h1><p>IDEACON needs an internet connection to load your workspace. Reconnect and try again.</p>" +
            "<button onclick=\"location.href='https://" + SITE_HOST + "/'\" >Try again</button></main></body></html>";
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && filePathCallback != null) {
            Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == LOCATION_PERMISSION_REQUEST && geoCallback != null) {
            boolean granted = false;
            for (int result : grantResults) if (result == PackageManager.PERMISSION_GRANTED) granted = true;
            geoCallback.invoke(geoOrigin, granted, false);
            geoCallback = null;
            geoOrigin = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (filePathCallback != null) filePathCallback.onReceiveValue(null);
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
