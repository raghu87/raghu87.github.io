package helloworld.droidnav.com.helloworld;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationManager;
import android.os.Binder;
import android.os.Bundle;
import android.os.IBinder;
import android.support.constraint.ConstraintLayout;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

public class LocationService extends Service {

    //https://developer.android.com/guide/components/bound-services#Binder
    //https://stackoverflow.com/questions/23586031/calling-activity-class-method-from-service-class

    private static final String TAG = "BOOMBOOMTESTGPS";
    private LocationManager mLocationManager = null;
    private static final int LOCATION_INTERVAL = 1000;
    private static final float LOCATION_DISTANCE = 0;

    private double longitude = 0.0;
    private double latitude = 0.0;
    private double altitude = 0.0;

    //LocationActivity la;
    //LayoutInflater inflater;
    //ConstraintLayout layout;
    //TextView tv_longitude;
    //LocationActivity locA;

    public LocationService() {
      Log.e(TAG, "Location Service Constructor");
    }

    private final IBinder mBinder = new LocationBinder();

    class LocationListener implements android.location.LocationListener
    {
        Location mLastLocation;

        public LocationListener(String provider)
        {
            Log.e(TAG, "LocationListener " + provider);
            mLastLocation = new Location(provider);
        }

        @Override
        public void onLocationChanged(Location location)
        {
            Log.e(TAG, "onLocationChanged: " + location);
            //tv_longitude = (TextView) layout.findViewById(R.id.tvHeading);
            //String longT = "Longitude: " + location.getLongitude();
            //Log.e(TAG, longT);
            //tv_longitude.setText("Longitude: ");// + location.getLongitude());
            //Log.e(TAG,"Finally "+tv_longitude.getText());
            mLastLocation.set(location);

            double lon=location.getLongitude();
            double lat=location.getLatitude();
            double alt = location.getAltitude();
            //Toast.makeText(LocationService.this, "Longitude: " + lon + ", Latitude: " + lat + ", Altitude: " + alt, Toast.LENGTH_LONG).show();

            setLongitude(lon);
            setLatitude(lat);
            setAltitude(alt);
            //locA.onLocationUpdate();
        }

        @Override
        public void onProviderDisabled(String provider)
        {
            Log.e(TAG, "onProviderDisabled: " + provider);
        }

        @Override
        public void onProviderEnabled(String provider)
        {
            Log.e(TAG, "onProviderEnabled: " + provider);
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras)
        {
            Log.e(TAG, "onStatusChanged: " + provider);
        }
    }

    LocationListener[] mLocationListeners = new LocationListener[] {
            new LocationListener(LocationManager.GPS_PROVIDER),
            new LocationListener(LocationManager.NETWORK_PROVIDER)
    };

    public class LocationBinder extends Binder {
        LocationService getService() {
            // Return this instance of LocalService so clients can call public methods
            return LocationService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        // TODO: Return the communication channel to the service.
        //throw new UnsupportedOperationException("Not yet implemented");
        return mBinder;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId)
    {
        Log.d(TAG, "onStartCommand");
        super.onStartCommand(intent, flags, startId);
        return START_STICKY;
    }

    @Override
    public void onCreate()
    {
        Log.e(TAG, "onCreate");
        initializeLocationManager();
        try {
            mLocationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER, LOCATION_INTERVAL, LOCATION_DISTANCE,
                    mLocationListeners[1]);
        } catch (java.lang.SecurityException ex) {
            Log.i(TAG, "fail to request location update, ignore", ex);
        } catch (IllegalArgumentException ex) {
            Log.d(TAG, "network provider does not exist, " + ex.getMessage());
        }
        try {
            mLocationManager.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER, LOCATION_INTERVAL, LOCATION_DISTANCE,
                    mLocationListeners[0]);
        } catch (java.lang.SecurityException ex) {
            Log.i(TAG, "fail to request location update, ignore", ex);
        } catch (IllegalArgumentException ex) {
            Log.d(TAG, "gps provider does not exist " + ex.getMessage());
        }

        //inflater = (LayoutInflater) LocationService.this.
        //        getSystemService(Context.LAYOUT_INFLATER_SERVICE);

        //layout = inflater.inflate(R.layout.activity_location, () findViewById(R.id.activityLocationP));
        //layout = inflater.inflate(R.layout.activity_location, );
        //TextView t = (TextView) LocationActivity.class..findViewById(R.id.tvHeading);
        //Log.e(TAG, "hgvhgcgh " +t.getText());
    }

    @Override
    public void onDestroy()
    {
        Log.e(TAG, "onDestroy");
        super.onDestroy();
        if (mLocationManager != null) {
            for (int i = 0; i < mLocationListeners.length; i++) {
                try {
                    mLocationManager.removeUpdates(mLocationListeners[i]);
                } catch (Exception ex) {
                    Log.i(TAG, "fail to remove location listners, ignore", ex);
                }
            }
        }
    }

    private void initializeLocationManager() {
        Log.e(TAG, "initializeLocationManager");
        if (mLocationManager == null) {
            mLocationManager = (LocationManager) getApplicationContext().getSystemService(Context.LOCATION_SERVICE);
        }
    }

    public double getLongitude () {
        return longitude;
    }

    public double getLatitude() {
        return latitude;
    }

    public double getAltitude() {
        return altitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void setAltitude(double altitude) {
        this.altitude = altitude;
    }
}
