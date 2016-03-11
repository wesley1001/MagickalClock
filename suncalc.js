exports.calc = function(date, lat, lng) {
    /* Port of https://github.com/mourner/suncalc */
    var SunCalc = {
        result: {},
        times: [
            [-0.833, 'sunrise',       'sunset'      ],
            [  -0.3, 'sunriseEnd',    'sunsetStart' ],
            [    -6, 'dawn',          'dusk'        ],
            [   -12, 'nauticalDawn',  'nauticalDusk'],
            [   -18, 'nightEnd',      'night'       ],
            [     6, 'goldenHourEnd', 'goldenHour'  ]
        ],
        PI:   Math.PI,
        sin:  Math.sin,
        cos:  Math.cos,
        tan:  Math.tan,
        asin: Math.asin,
        atan: Math.atan2,
        acos: Math.acos,
        rad:  Math.PI / 180,
        dayMs:  1000 * 60 * 60 * 24,
        J0:     0.0009,
        J1970:  2440588,
        J2000:  2451545,
        e:      (Math.PI / 180) * 23.4397,
        addTime: function (angle, riseName, setName) {
            times.push([angle, riseName, setName]);
        },
        getMoonPosition: function (date, lat, lng) {

            var lw  = this.rad * -lng;
            var phi = this.rad * lat;
            var d   = this._toDays(date);

            var c = this._moonCoords(d);
            var H = this._siderealTime(d, lw) - c.ra;
            var h = this._altitude(H, phi, c.dec);
            // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
            var pa = this.atan(this.sin(H), this.tan(phi) * this.cos(c.dec) - this.sin(c.dec) * this.cos(H));

            h = h + this._astroRefraction(h); // altitude correction for refraction

            return {
                azimuth: this._azimuth(H, phi, c.dec),
                altitude: h,
                distance: c.dist,
                parallacticAngle: pa
            };
        },
        getPosition: function (date, lat, lng) {
            var lw  = this.rad * -lng;
            var phi = this.rad * lat;
            var d   = this._toDays(date);

            var c  = this._sunCoords(d);
            var H  = this._siderealTime(d, lw) - c.ra;
            var azimuth = this._azimuth(H, phi, c.dec);
            var altitude = this._altitude(H, phi, c.dec);

            return {
                azimuth: azimuth,
                altitude: altitude
            };
        },
        getTimes: function (date, lat, lng) {

            var lw = this.rad * -lng;
            var phi = this.rad * lat;

            var d = this._toDays(date);
            var n = this._julianCycle(d, lw);
            var ds = this._approxTransit(0, lw, n);

            var M = this._solarMeanAnomaly(ds);
            var L = this._eclipticLongitude(M);
            var dec = this._declination(L, 0);

            var Jnoon = this._solarTransitJ(ds, M, L);

            var i, len, time, Jset, Jrise;


            var result = {
                solarNoon: this._fromJulian(Jnoon),
                nadir: this._fromJulian(Jnoon - 0.5)
            };

            for (i = 0, len = this.times.length; i < len; i += 1) {
                time = this.times[i];

                Jset = this._getSetJ(time[0] * this.rad, lw, phi, dec, n, M, L);
                Jrise = Jnoon - (Jset - Jnoon);

                result[time[1]] = this._fromJulian(Jrise);
                result[time[2]] = this._fromJulian(Jset);
            }

            return result;
        },
        // Moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas
        _moonCoords: function(d) { // geocentric ecliptic coordinates of the moon
            var L = rad * (218.316 + 13.176396 * d); // ecliptic longitude
            var M = rad * (134.963 + 13.064993 * d); // mean anomaly
            var F = rad * (93.272 + 13.229350 * d);  // mean distance

            var l  = L + rad * 6.289 * sin(M); // longitude
            var b  = rad * 5.128 * sin(F);     // latitude
            var dt = 385001 - 20905 * cos(M);  // distance to the moon in km

            return {
                ra: this._rightAscension(l, b),
                dec: this._declination(l, b),
                dist: dt
            };
        },
        _toJulian: function(date) { return date.valueOf() / this.dayMs - 0.5 + this.J1970; },
        _fromJulian: function(j)  { return new Date((j + 0.5 - this.J1970) * this.dayMs); },
        _toDays: function(date)   { return this._toJulian(date) - this.J2000; },
        _rightAscension: function (l, b) { return this.atan(this.sin(l) * this.cos(this.e) - this.tan(b) * this.sin(this.e), this.cos(l)); },
        _declination: function(l, b) { return this.asin(this.sin(b) * this.cos(this.e) + this.cos(b) * this.sin(this.e) * this.sin(l)); },
        _azimuth: function(H, phi, dec) { return this.atan(this.sin(H), this.cos(H) * this.sin(phi) - this.tan(dec) * this.cos(phi)); },
        _altitude: function(H, phi, dec) { return this.asin(this.sin(phi) * this.sin(dec) + this.cos(phi) * this.cos(dec) * this.cos(H)); },
        _siderealTime: function(d, lw) { return this.rad * (280.16 + 360.9856235 * d) - lw; },
        _julianCycle: function(d, lw) { return Math.round(d - this.J0 - lw / (2 * this.PI)); },
        _approxTransit: function(Ht, lw, n) { return this.J0 + (Ht + lw) / (2 * this.PI) + n; },
        _solarTransitJ: function(ds, M, L)  { return this.J2000 + ds + 0.0053 * this.sin(M) - 0.0069 * this.sin(2 * L); },
        _hourAngle: function(h, phi, d) { return this.acos((this.sin(h) - this.sin(phi) * this.sin(d)) / (this.cos(phi) * this.cos(d))); },
        _hoursLater: function(date, h) { return new Date(date.valueOf() + h * this.dayMs / 24); },
        _astroRefraction: function(h) {
            if (h < 0) // the following formula works for positive altitudes only.
                h = 0; // if h = -0.08901179 a div/0 would occur.

            // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
            // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
            return 0.0002967 / this.tan(h + 0.00312536 / (h + 0.08901179));
        },
        _solarMeanAnomaly: function(d) { return this.rad * (357.5291 + 0.98560028 * d); },
        _eclipticLongitude: function(M) {

            var C = this.rad * (1.9148 * this.sin(M) + 0.02 * this.sin(2 * M) + 0.0003 * this.sin(3 * M)); // equation of center
            var P = this.rad * 102.9372; // perihelion of the Earth

            return M + C + P + this.PI;
        },
        _sunCoords: function(d) {

            var M = this._solarMeanAnomaly(d);
            var L = this._eclipticLongitude(M);
            var declination = this._declination(L, 0)
            var rightAscension = this._rightAscension(L, 0);
            return {
                dec: declination,
                ra: rightAscension
            };
        },
        // moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas
        _moonCoords: function(d) { // geocentric ecliptic coordinates of the moon
            var L = this.rad * (218.316 + 13.176396 * d); // ecliptic longitude
            var M = this.rad * (134.963 + 13.064993 * d); // mean anomaly
            var F = this.rad * (93.272 + 13.229350 * d);  // mean distance

            var l  = L + this.rad * 6.289 * this.sin(M); // longitude
            var b  = this.rad * 5.128 * this.sin(F);     // latitude
            var dt = 385001 - 20905 * this.cos(M);  // distance to the moon in km

            return {
                ra: this._rightAscension(l, b),
                dec: this._declination(l, b),
                dist: dt
            };
        },
        // returns set time for the given sun altitude
        _getSetJ: function(h, lw, phi, dec, n, M, L) {
            var w = this._hourAngle(h, phi, dec);
            var a = this._approxTransit(w, lw, n);
            return this._solarTransitJ(a, M, L);
        }
    };

    var sunCalc = Object.create(SunCalc);
    var result = sunCalc.getTimes(date, lat, lng);
    return result;
}
