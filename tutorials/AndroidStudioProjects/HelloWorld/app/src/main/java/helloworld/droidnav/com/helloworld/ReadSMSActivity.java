package helloworld.droidnav.com.helloworld;

import android.Manifest;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.database.Cursor;
import android.net.Uri;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;
import android.widget.Toast;

public class ReadSMSActivity extends AppCompatActivity {

    //http://androidsourcecode.blogspot.com/2010/10/android-reading-inbox-sms.html
    //https://stackoverflow.com/questions/848728/how-can-i-read-sms-messages-from-the-device-programmatically-in-android
    private static final String TAG = "BOOMBOOMTESTGPS";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_read_sms);

        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.READ_SMS)
                != PackageManager.PERMISSION_GRANTED) {
            // Permission is not granted
            Log.e(TAG, "Permission is not granted");
            if(ActivityCompat.shouldShowRequestPermissionRationale(this,Manifest.permission.READ_SMS)) {
                Log.e(TAG,"Displaying READ_SMS permission rationale to provide additional context.");
                Toast.makeText(this,"READ_SMS IS NEEDED",Toast.LENGTH_SHORT).show();
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_SMS}, 0);
            } else {
                Log.e(TAG,"Else Displaying READ_SMS permission rationale to provide additional context.");
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_SMS}, 0);
            }

        } else {
            // Permission has already been granted
            Log.e(TAG, "Permission has already been granted");
            onStartService();
        }

        /*TextView view = new TextView(this);
        Uri uriSMSURI = Uri.parse("content://sms/inbox");
        Cursor cur = getContentResolver().query(uriSMSURI, null, null, null,null);
        String sms = "";
        while (cur.moveToNext()) {
            sms += "From :" + cur.getString(2) + " : " + cur.getString(11)+"\n";
        }
        view.setText(sms);
        setContentView(view);*/
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

    public void onStartService() {
        TextView view = new TextView(this);
        Cursor cursor = getContentResolver().query(Uri.parse("content://sms/inbox"), null, null, null, null);

        String msgData = "";
        if (cursor.moveToFirst()) { // must check the result to prevent exception
            do {

                for(int idx=0;idx<cursor.getColumnCount();idx++)
                {
                    //msgData += " " + cursor.getColumnName(idx) + ":" + cursor.getString(idx);
                    msgData += "\n " + cursor.getColumnName(idx);
                    msgData += "\n " + cursor.getString(idx);
                    if(cursor.getColumnName(idx).equals("address")) {
                        //msgData += "\n " + cursor.getColumnName(idx) + ":" + cursor.getString(idx);
                    }
                }
                // use msgData
            } while (cursor.moveToNext());
        } else {
            // empty box, no SMS
            Log.e(TAG,"empty box, no SMS");
        }
        Log.e(TAG,"message is " + msgData);
        view.setText(msgData);
        setContentView(view);
    }


    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onRestart() {
        super.onRestart();
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onStop() {
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }
}


/*

message is
     _id
     654
     thread_id
     568
     address
     AXKTKBNK
     person
     null
     date
     1529328988808
     date_sent
     1529328989000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     x008684x CREDITED for Rs.1,000.00/- ATM-CWRR/+7TH MAIN LI- Balance is Rs.17,554.47(18/06/2018:18:58:30)
     service_center
     +919845060893
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     653
     thread_id
     567
     address
     ADKTKBNK
     person
     null
     date
     1529328984607
     date_sent
     1529328984000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     x008684x DEBITED for Rs.1,000.00/- NFS-CWDR/+7TH MAIN LI- Balance is Rs.17,554.47(18/06/2018:18:58:22)
     service_center
     +919845060893
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     652
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1527827915439
     date_sent
     1527827913000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     ok.Thank you.
     service_center
     +919845087001
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     585
     thread_id
     432
     address
     +919480979197
     person
     50
     date
     1525491735274
     date_sent
     1525491733000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     8880838838 srisaikrishna township nelamangala
     service_center
     +919442099997
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     442
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1522326160883
     date_sent
     1522326161000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     Thank you. I received the same.
     service_center
     +919845087001
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     428
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1522231568089
     date_sent
     1522231561000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     I'll call you back later.
     service_center
     +919845087001
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     387
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1522053757437
     date_sent
     1522053757000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     Ok. Thank you.
     service_center
     +919845087001
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     385
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1522053549157
     date_sent
     1522053548000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     I received Rs.49000, Thank you.
     service_center
     +919845087001
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     381
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1522053208447
     date_sent
     1522053208000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     I received Rs.1000, Thank you.
     service_center
     +919845087001
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     306
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1521346984771
     date_sent
     1521346968000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     Hi Raghavendra,
    Happy Ugadi to you and your family

    Please send your and your brothers' PAN card numbers, photo copies, permanent address in email to tganesan@yahoo.com. I will send the softcopy to your mail id.

    Regards Ganesan
     service_center
     +919845087001
     locked
     0
     sub_id
     1
     error_code
     0
     creator
     com.google.android.apps.messaging
     seen
     1
     _id
     300
     thread_id
     266
     address
     +919845051406
     person
     221
     date
     1521125624252
     date_sent
     1521125624000
     protocol
     0
     read
     1
     status
     -1
     type
     1
     reply_path_present
     0
     subject
     null
     body
     Hi Raghavendra, I got y


 */