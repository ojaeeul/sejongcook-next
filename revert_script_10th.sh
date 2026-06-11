#!/bin/bash
set -e

echo "1. Checking out all files from 7c10a5a..."
git checkout 7c10a5a -- .

echo "2. Handling files added since 7c10a5a..."
git diff --name-status 7c10a5a HEAD | grep '^A' | awk '{print $2}' | while read file; do
    # If the file is NOT in our exclusion list, delete it
    if [[ "$file" != "Sejong/SejongAttendance/public/phonebook.html" && \
          "$file" != "Sejong/SejongAttendance/public/phonebook.js" && \
          "$file" != "Sejong/SejongAttendance/public/cycle_settings.html" && \
          "$file" != "Sejong/SejongAttendance/public/stats.html" && \
          "$file" != "Sejong/SejongAttendance/public/stats.js" && \
          "$file" != "Sejong/SejongAttendance/public/paid_list.html" && \
          "$file" != "Sejong/SejongAttendance/public/paid_list.js" && \
          "$file" != "Sejong/SejongAttendance/public/tuition.html" && \
          "$file" != "Sejong/SejongAttendance/public/tuition_v3.js" && \
          "$file" != "Sejong/SejongAttendance/public/tuition_v4.js" && \
          "$file" != "Sejong/SejongAttendance/public/app.html" && \
          "$file" != "add_mobile_link.py" && \
          "$file" != "add_hamburger.py" && \
          "$file" != "public/manifest.json" && \
          "$file" != "public/sw.js" && \
          "$file" != "Sejong/public/phonebook.html" && \
          "$file" != "Sejong/public/phonebook.js" && \
          "$file" != "Sejong/public/cycle_settings.html" && \
          "$file" != "Sejong/public/stats.html" && \
          "$file" != "Sejong/public/stats.js" && \
          "$file" != "Sejong/public/paid_list.html" && \
          "$file" != "Sejong/public/paid_list.js" && \
          "$file" != "Sejong/public/tuition.html" && \
          "$file" != "Sejong/public/tuition_v3.js" && \
          "$file" != "Sejong/public/tuition_v4.js" && \
          "$file" != "Sejong/public/app.html" && \
          "$file" != "public/sejong/phonebook.html" && \
          "$file" != "public/sejong/phonebook.js" && \
          "$file" != "public/sejong/cycle_settings.html" && \
          "$file" != "public/sejong/stats.html" && \
          "$file" != "public/sejong/stats.js" && \
          "$file" != "public/sejong/paid_list.html" && \
          "$file" != "public/sejong/paid_list.js" && \
          "$file" != "public/sejong/tuition.html" && \
          "$file" != "public/sejong/tuition_v3.js" && \
          "$file" != "public/sejong/tuition_v4.js" && \
          "$file" != "public/sejong/app.html" ]]; then
        echo "Removing newly added file: $file"
        git rm -f "$file" || rm -f "$file"
    fi
done

echo "3. Restoring excluded files back to HEAD state..."
git checkout HEAD -- \
    Sejong/SejongAttendance/public/phonebook.html \
    Sejong/SejongAttendance/public/phonebook.js \
    Sejong/SejongAttendance/public/cycle_settings.html \
    Sejong/SejongAttendance/public/stats.html \
    Sejong/SejongAttendance/public/stats.js \
    Sejong/SejongAttendance/public/paid_list.html \
    Sejong/SejongAttendance/public/paid_list.js \
    Sejong/SejongAttendance/public/tuition.html \
    Sejong/SejongAttendance/public/tuition_v3.js \
    Sejong/SejongAttendance/public/tuition_v4.js \
    Sejong/SejongAttendance/public/app.html \
    add_mobile_link.py \
    add_hamburger.py \
    public/manifest.json \
    public/sw.js \
    2>/dev/null || echo "Some excluded files didn't exist in HEAD, ignoring."

echo "Also checking out for the synced directories to avoid immediate diff..."
git checkout HEAD -- \
    Sejong/public/phonebook.html \
    Sejong/public/phonebook.js \
    Sejong/public/cycle_settings.html \
    Sejong/public/stats.html \
    Sejong/public/stats.js \
    Sejong/public/paid_list.html \
    Sejong/public/paid_list.js \
    Sejong/public/tuition.html \
    Sejong/public/tuition_v3.js \
    Sejong/public/tuition_v4.js \
    Sejong/public/app.html \
    public/sejong/phonebook.html \
    public/sejong/phonebook.js \
    public/sejong/cycle_settings.html \
    public/sejong/stats.html \
    public/sejong/stats.js \
    public/sejong/paid_list.html \
    public/sejong/paid_list.js \
    public/sejong/tuition.html \
    public/sejong/tuition_v3.js \
    public/sejong/tuition_v4.js \
    public/sejong/app.html \
    2>/dev/null || echo "Some synced files didn't exist, ignoring."

echo "4. Committing the rollback..."
git add .
git commit -m "Rollback: Revert to 7c10a5a (June 10 10AM), keeping Phonebook, Cycle Settings, Stats/Tuition, and Mobile app changes"

echo "Rollback script completed!"
