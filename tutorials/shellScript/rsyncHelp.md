rsync -av --include='*/' --include='*camera_info.csv' --include='*_rt.csv' --exclude='*' /data/samba/internal-docs/vidteq-spec-manuals-userguides/gaze/intel/delivery_data/2019-03-22 raghu@10.4.71.114:/home/raghu/Documents/calib/

rsync -av --exclude='changed' --exclude='Sample' --exclude='geojson' --include='*/' --include='*camera_info.csv' --include='*_rt.csv' --exclude='*' /data/samba/internal-docs/vidteq-spec-manuals-userguides/gaze/intel/delivery_data/ raghu@10.4.71.114:/home/raghu/Documents/calib/
