package com.ideacon.app;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class IdeaconMessagingService extends FirebaseMessagingService {
    @Override
    public void onNewToken(String token) {
        super.onNewToken(token);
        getSharedPreferences("ideacon", MODE_PRIVATE).edit().putString("fcm_token", token).apply();
    }

    @Override
    public void onMessageReceived(RemoteMessage message) {
        super.onMessageReceived(message);
        String title = message.getNotification() != null && message.getNotification().getTitle() != null
            ? message.getNotification().getTitle() : "IDEACON update";
        String body = message.getNotification() != null && message.getNotification().getBody() != null
            ? message.getNotification().getBody() : "You have a new update.";
        String path = message.getData().get("path");
        if (path == null || !path.startsWith("/") || path.startsWith("//")) path = "/notifications";
        Intent open = new Intent(this, MainActivity.class);
        open.setAction(Intent.ACTION_VIEW);
        open.setData(Uri.parse("https://ideacon.vercel.app" + path));
        open.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pending = PendingIntent.getActivity(this, path.hashCode(), open, pendingFlags);

        NotificationCompat.Builder notification = new NotificationCompat.Builder(this, "ideacon_updates")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pending)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.notify((int) (System.currentTimeMillis() & 0x7fffffff), notification.build());
    }
}
