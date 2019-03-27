package helloworld.droidnav.com.helloworld;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.location.Location;
import android.location.LocationManager;
import android.os.IBinder;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

public class LocationActivity extends AppCompatActivity {

    //GPS Links I found
    //1) https://github.com/codepath/android_guides/issues/220
    //2) https://stackoverflow.com/questions/28535703/best-way-to-get-user-gps-location-in-background-in-android
    //3) http://www.coderzheaven.com/2012/07/14/http-call-repeatedly-service-android/
    //https://www.forward.com.au/javaProgramming/HowToStopAThread.html

    private static final String TAG = "BOOMBOOMTESTGPS";
    LocationService lService;
    boolean mBound = false;

    private TextView txtLon, txtLat, txtAlt;
    private Button btnUpdateService;

    private MyThread mythread;
    public boolean isRunning = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_location);

        txtLon = (TextView) findViewById(R.id.tv_longitude);
        txtLat = (TextView) findViewById(R.id.tv_latitude);
        txtAlt = (TextView) findViewById(R.id.tv_height);
        btnUpdateService = (Button) findViewById(R.id.btn_updateService);
        btnUpdateService.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                locationUpdate();
            }
        });

        mythread  = new MyThread();

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
                != PackageManager.PERMISSION_GRANTED ) {
            // Permission is not granted
            Log.e(TAG, "Permission is not granted");
            if(ActivityCompat.shouldShowRequestPermissionRationale(this,Manifest.permission.ACCESS_FINE_LOCATION)) {
                Log.e(TAG,"Displaying Fine GPS permission rationale to provide additional context.");
                Toast.makeText(this,"GPS FINE LOCATION IS NEEDED",Toast.LENGTH_SHORT).show();
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 0);
            } else {
                Log.e(TAG,"Else Displaying Fine GPS permission rationale to provide additional context.");
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 0);
            }

        } else {
            // Permission has already been granted
            Log.e(TAG, "Permission has already been granted");
            //startService(new Intent(this, LocationService.class));
            onStartService();
        }


    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        Log.e(TAG, "finally "+ requestCode);
        switch (requestCode) {
            case 0: {
                // If request is cancelled, the result arrays are empty.
                if (grantResults.length > 0
                        && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // permission was granted, yay! Do the
                    // contacts-related task you need to do.
                    Log.e(TAG, "finally done");
                    //startService(new Intent(this, LocationService.class));
                    //locationInit();
                    onStartService();
                } else {
                    // permission denied, boo! Disable the
                    // functionality that depends on this permission.
                    Log.e(TAG, "finally denied");
                }
                //return;
            }

            // other 'case' lines to check for other
            // permissions this app might request.
        }
    }

    /* Defined by ServiceCallbacks interface */
    public void onStartService() {
        // Bind to LocalService
        checkLocService();
        Intent intent = new Intent(this, LocationService.class);
        bindService(intent, mConnection, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void onStart() {
        super.onStart();
        Log.e(TAG,"Location OnStart");
        if(!isRunning){
            mythread = null;
            mythread  = new MyThread();
            mythread.start();
            isRunning = true;
        }
    }

    @Override
    protected void onStop() {
        super.onStop();
        Log.e(TAG,"Location OnStop");
        checkLocService();

        if(isRunning){
            Log.e(TAG,"is running at onStop");
            mythread.interrupt();
            //mythread.stop();
            isRunning = false;
        }
    }

    @Override
    protected void onRestart() {
        super.onRestart();
        Log.e(TAG,"Location OnRestart");
    }

    @Override
    protected void onResume() {
        super.onResume();
        Log.e(TAG,"Location OnResume");
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
                == PackageManager.PERMISSION_GRANTED ) {
            onStartService();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.e(TAG,"Location OnDestroy");
        if(isRunning){
            Log.e(TAG,"is running at onDestroy");
            mythread.interrupt();
            //mythread.stop();
            isRunning = false;
        }
    }

    private void checkLocService() {
        Log.e(TAG,"Location checkLocService");
        if(mBound) {
            unbindService(mConnection);
        }
        mBound = false;
    }

    public void locationUpdate () {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                == PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
                == PackageManager.PERMISSION_GRANTED && mBound) {
            double lonT = lService.getLongitude();
            double latT = lService.getLatitude();
            double altT = lService.getAltitude();
            if(lService.getLongitude() > 0.0) {
                txtLon.setText("Longitude: " + lonT);
            }
            if(lService.getLatitude() > 0.0) {
                txtLat.setText("Latitude: " + latT);
            }
            if(lService.getAltitude() > 0.0) {
                txtAlt.setText("Height: " + altT);
            }
            Log.e(TAG, "Longitude: " + lonT + ", Latitude: " + latT + ", Altitude: " + altT);
            //Toast.makeText( this, "Longitude: " + lonT + ", Latitude: " + latT + ", Altitude: " + altT, Toast.LENGTH_LONG).show();
        } else {
            Log.e(TAG,"else location Update");
            //Toast.makeText(this,"else location Update",Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Checks the orientation of the screen
        if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            Toast.makeText(this, "landscape on location activity", Toast.LENGTH_SHORT).show();
        } else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT){
            Toast.makeText(this, "portrait on location activity", Toast.LENGTH_SHORT).show();
        }
    }

    /** Defines callbacks for service binding, passed to bindService() */
    private ServiceConnection mConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName className,
                                       IBinder service) {
            // We've bound to LocalService, cast the IBinder and get LocalService instance
            LocationService.LocationBinder binder = (LocationService.LocationBinder) service;
            lService = binder.getService();
            Log.e(TAG,"onServiceConnected");
            mBound = true;
        }

        @Override
        public void onServiceDisconnected(ComponentName arg0) {
            Log.e(TAG,"onServiceDisConnected");
            mBound = false;
        }
    };

    class MyThread extends Thread {
        static final long DELAY = 1000;
        @Override
        public void run(){
            while(isRunning){
                Log.d(TAG,"Running");
                try {
                    //readWebPage();
                    Log.e(TAG,"MyThread is running");
                    locationUpdate();
                    Thread.sleep(DELAY);
                } catch (InterruptedException e) {
                    isRunning = false;
                    Log.e(TAG,"myThread catch");
                    //e.printStackTrace();
                }
            }
        }

    }
}