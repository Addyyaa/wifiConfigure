export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/lib:/config/lib:/customer/lib:/customer/bluetooth/lib:/software/lib:/software/bin:/software/bin/pintura/release/bin:upgrade/lib:/config/wifi:/software/qrcode

kill -9 $(pidof web)
kill -9 $(pidof hostapd)
kill -9 $(pidof udhcpd)
ifconfig wlan1 down

ifconfig wlan1 up
ifconfig wlan1 192.168.10.1

cd /config/wifi
./hostapd /config/wifi/hostapd.conf -B >/dev/null 2>&1 &

sleep 0.5
udhcpd -fS /config/wifi/udhcpd.conf >/dev/null 2>&1 &

sleep 0.5
cd /software/bin/
./web &
