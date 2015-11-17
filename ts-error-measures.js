/** 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var TSEM = {
    anyErrorInData: function (yLength, fLength) {
// Possible errors
        if (yLength != fLength)
            return "<li class='warning'>Different number of values: desired:" + yLength
                    + "; yielded: " + fLength + "</li>\n";
        if (yLength == 0 || fLength == 0)
            return "<li class='warning'>At least one of the sets has 0 values</li>\n";
        return null;
    }
    /**
     * Call to the functions needed to compute the error measures
     * @param {string} _idDesired Id of the textarea where desired values are
     * @param {vetor of string} _idsYielded Vector with the ids of the textareas where yielded values are
     * @param {string} _idResults Id of the layer where result will be showed
     * @returns Nothing
     */
    , compare: function (_idDesired, _idsYielded, _idResults) {
        var y = TSEM.textarea2vector("#" + _idDesired);
        var msg = "";
        fs = (Array.isArray(_idsYielded) ? _idsYielded : [_idsYielded]);
        fs.forEach(function (a) {
            var f = TSEM.textarea2vector("#" + a);
            // In case of error
            if (tmp = TSEM.anyErrorInData(y.length, f.length)) {
                $("#" + _idResults).html(tmp);
                return;
            }
            // --------------------------------------------------- Showing info to user                  
            // In case everything is right
            msg += "<h4>" + _idDesired + " vs " + a + "</h4>\n";
            msg += TSEM.measure("MSE", TSEM.MSE(y, f));
            msg += TSEM.measure("RMSE", TSEM.RMSE(y, f));
            msg += TSEM.measure("MAE", TSEM.MAE(y, f));
            msg += TSEM.measure("MdAE", TSEM.MdAE(y, f));
            msg += TSEM.measure("MAPE", TSEM.MAPE(y, f));
            msg += TSEM.measure("MdAPE", TSEM.MdAPE(y, f));
            msg += TSEM.measure("RMSPE", TSEM.RMSPE(y, f));
            msg += TSEM.measure("RMdSPE", TSEM.RMdSPE(y, f));
            msg += TSEM.measure("sMAPE", TSEM.sMAPE(y, f));
            msg += TSEM.measure("sMdAPE", TSEM.sMdAPE(y, f));
            msg += TSEM.measure("MASE", TSEM.MASE(y, f));
            msg += TSEM.measure("RMSSE", TSEM.RMSSE(y, f));
            msg += TSEM.measure("MdASE", TSEM.MdASE(y, f));
            msg += "<hr/>\n";
            $("#" + _idResults).html(msg);
        });
    }
    /**
     * Converts lines from textarea (identified by _id) to number
     * @param {string} _id Identifier of the textare to convert
     * @post Stores number in a vector, after replacing , by . (just in case)
     * @post Modifies the textarea writing the numbers obtained
     * @return The vector containing the numbers
     */

    , textarea2vector: function (_id) {
        v = $(_id).val().split(/\r*\n/).map(function (e) {
            return parseFloat(e.replace(",", "."))
        }).filter(function (e) {
            return !isNaN(e)
        });
        $(_id).val(v.join("\n"));
        return v;
    }

    /**
     * Computes a minus b for sorting purposes
     * @param {number} a First number
     * @param {number} b Second number
     * @returns {number} Returns a-b
     */
    , minus: function (a, b) {
        return a - b;
    }

    /**
     * Computes the mean value of a vector: (1/n)*sum(v)
     * @param {Vector} v The vector of values
     * @returns {Number} The mean value
     */
    , mean: function (v) {
        if (v.length == 0)
            throw "Error in TMSE.mean: mean can't be computed for an empty vector";
        return (1 / v.length) * v.reduce(function (prev, a) {
            return prev + a;
        }, 0);
    }

    /**
     * Computes median for a vector of number
     * @param {vector} v The vector of number (needs not to be sorted)
     * @returns {Number|TSEM.median.v} The median of v
     */
    , median: function (v) {
        if (v.length == 0)
            throw "Error in TMSE.median: median can't be computed for an empty vector";
        v = v.sort(this.minus);
        return ((l = v.length) % 2) ? v[Math.floor(l / 2)] : (v[Math.floor(l / 2) - 1] + v[Math.floor(l / 2)]) / 2;
    }

    /**
     * Creates a DIV with a string and a value: MEASURE: value
     * @param {string} name The name of the measure
     * @param {number} value The value of the measure
     * @returns {String} A string with a div (of class tmse-measure) to show the name and the value of the measure
     */
    , measure: function (name, value) {
        return "<div class='tmse-measure'>" + name + ": " + value + ";</div>";
    }

    /**
     * Computes the vector of errors: e(t)=y(t)-f(t)
     * @param {vector of numbers} y Expected values
     * @param {vector of numbers} f Forecasted values
     * @returns {vector of numbers} Vector containing the different y(t)-f(t)
     */
    , et: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.et: vectors Y (expected) and F (forecasted) have different size";
        return y.map(function (a, i) {
            return y[i] - f[i];
        });
    }

    , pt: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.pt: vectors Y (expected) and F (forecasted) have different size";

        return this.et(y, f).map(function (a, t) {
            return 100 * a / y[t];
        });
    }

    , for_sMAPE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.fo_sMAPE: vectors Y (expected) and F (forecasted) have different size";

        return y.map(function (a, t) {
            return 200 * Math.abs(y[t] - f[t]) / (y[t] + f[t]);
        });
    }


    , qt: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.qt: vectors Y (expected) and F (forecasted) have different size";

        var denom = (1 / (y.length - 1)) * y.reduce(function (prev, a, t) {
            return (t > 0) ? prev + Math.abs(y[t] - y[t - 1]) : 0;
        }, 0);
        return this.et(y, f).map(function (a) {
            return (a / denom);
        }).slice(1);
    }

    , MSE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.MSE: vectors Y (expected) and F (forecasted) have different size";

        return this.mean(this.et(y, f).map(function (a, i) {
            return Math.pow(a, 2);
        }));
    }

    , RMSE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.RMSE: vectors Y (expected) and F (forecasted) have different size";
        return Math.sqrt(this.MSE(y, f));
    }

    , MAE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.MAE: vectors Y (expected) and F (forecasted) have different size";

        return this.mean(this.et(y, f).map(Math.abs));
    }


    , MdAE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.MdAE: vectors Y (expected) and F (forecasted) have different size";

        return this.median(this.et(y, f).map(Math.abs).sort(this.minus));
    }

    , MAPE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.MAPE: vectors Y (expected) and F (forecasted) have different size";

        return  this.mean(this.pt(y, f).map(Math.abs));
    }

    , MdAPE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.MdAPE: vectors Y (expected) and F (forecasted) have different size";

        return this.median(this.pt(y, f).map(Math.abs));
    }

    , RMSPE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.RMSPE: vectors Y (expected) and F (forecasted) have different size";

        return Math.sqrt(this.mean(this.pt(y, f).map(function (a) {
            return a * a;
        })));
    }
    , RMdSPE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.RMdSPE: vectors Y (expected) and F (forecasted) have different size";

        return Math.sqrt(this.median(this.pt(y, f).map(function (a) {
            return a * a;
        })));
    }

    //Symmetric Mean Absolute Percentage Error (sMAPE) = median(200|Yt − Ft|/(Yt + Ft))                    
    , sMAPE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.sMAPE: vectors Y (expected) and F (forecasted) have different size";

        return this.mean(this.for_sMAPE(y, f));
    }

    //Symmetric Median Absolute Percentage Error (sMdAPE) = median(200|Yt − Ft|/(Yt + Ft))                    
    , sMdAPE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.sMdAPE: vectors Y (expected) and F (forecasted) have different size";

        return this.median(this.for_sMAPE(y, f));
    }

    // Mean Absolute Scaled Error
    , MASE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.MASE: vectors Y (expected) and F (forecasted) have different size";

        return this.mean(this.qt(y, f).map(Math.abs));
    }

    //Root Mean Squared Scaled Error (RMSSE)
    , RMSSE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.RMSSE: vectors Y (expected) and F (forecasted) have different size";

        return Math.sqrt(this.mean(this.qt(y, f).map(function (a) {
            return a * a;
        })));
    }
    // Median Absolute Scaled Error (MdASE)
    , MdASE: function (y, f) {
        if (y.length !==f.length)
            throw "Error in TMSE.MdASE: vectors Y (expected) and F (forecasted) have different size";

        return this.median(this.qt(y, f).map(Math.abs));
    }
};
