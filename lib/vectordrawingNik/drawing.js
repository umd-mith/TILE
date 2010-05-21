(function () {
     $(function () {
           var drawer = new VectorDrawer($("input[name='mode']:checked").val(),
               1, [], $("#overMe"));
           $("#mode-toggles").change(function (e) {
               drawer.drawMode($("input[name='mode']:checked").val());
           });
           $("#scale").val(1);
           $("#scale").change(function (e) {
               drawer.scale($("#scale").val());
           });
     });
})();
