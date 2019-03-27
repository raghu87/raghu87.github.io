package helloworld.droidnav.com.helloworld;

import android.content.Intent;
import android.content.res.Configuration;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

public class MainActivity extends AppCompatActivity {

    //https://developer.android.com/guide/topics/resources/runtime-changes

    private Button btnCompass, btnLocation, btnReadSMS, btnRecordAudio;

    private void compassActivityInit() {
        btnCompass = (Button) findViewById(R.id.btnCompass);
        btnCompass.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent compassActivity = new Intent(MainActivity.this,ActivityCompass.class);
                startActivity(compassActivity);
            }
        });
    }

    private void locationActivityInit() {
       btnLocation = (Button) findViewById(R.id.btnLocation);
       btnLocation.setOnClickListener(new View.OnClickListener() {
           @Override
           public void onClick(View view) {
               Intent locationActivity = new Intent(MainActivity.this,LocationActivity.class);
               startActivity(locationActivity);
           }
       });
    }

    private void readSMSInit() {
        btnReadSMS = (Button) findViewById(R.id.btnReadSMS);
        btnReadSMS.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent readSmsActivity = new Intent(MainActivity.this, ReadSMSActivity.class);
                startActivity(readSmsActivity);
            }
        });
    }

    private void onRecordAudio () {
        btnRecordAudio = (Button) findViewById(R.id.btn_recordAudio);
        btnRecordAudio.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent recordAudioActivity = new Intent(MainActivity.this, RecordAudioActivity.class);
                startActivity(recordAudioActivity);
            }
        });
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        compassActivityInit();
        locationActivityInit();
        readSMSInit();
        onRecordAudio();
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Checks the orientation of the screen
        if (newConfig.orientation == Configuration.ORIENTATION_LANDSCAPE) {
            Toast.makeText(this, "landscape on main activity", Toast.LENGTH_SHORT).show();
        } else if (newConfig.orientation == Configuration.ORIENTATION_PORTRAIT){
            Toast.makeText(this, "portrait on main activity", Toast.LENGTH_SHORT).show();
        }
    }
}
