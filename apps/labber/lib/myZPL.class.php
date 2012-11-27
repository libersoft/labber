<?php

/**
 * Classe per la gestione delle stampanti ZPL per la generazione di etichette
 *
 * Example ZPL output
 * ^XA
 * ^FO70,20^ADN,26,14^FDMATTEO^FS
 * ^FO70,40^ADN,26,14^FDBUCO^FS
 * ^FO70,60^ADN,26,14^FDMALEDETTO^FS
 * ^FS
 * ^XZ
 *
 * @author scorp
 */
class myZPL {

    private $X_orig;
    private $Y_orig;
    private $font_width;
    private $font_height;

    private $zpl_buffer;
    private $zpl_linecounter;

    public function __construct($X_orig, $Y_orig, $font_width, $font_height) {
      $this->X_orig = $X_orig;
      $this->Y_orig = $Y_orig;
      $this->font_width = $font_width;
      $this->font_height = $font_height;

      // start
      $this->zpl_buffer = "^XA\n";
      // FIXME: portare fuori - allineamento verticale con la nostra stampante
      $this->zpl_buffer .= "^LT-30\n";
      $this->zpl_linecounter = 0;
    }

    public function write($text) {
      // Definisco l'offset
      $this->zpl_buffer .= "^FO".$this->X_orig.",".($this->Y_orig + $this->font_height * $this->zpl_linecounter);
      // Imposto il font
      $this->zpl_buffer .= "^ADN,".$this->font_width.",".$this->font_height;
      // Scrivo il testo
      $this->zpl_buffer .= "^FD".$text."^FS\n";

      $this->zpl_linecounter = $this->zpl_linecounter + 1;
    }

    /*
     * EAN-13 Example:
     *
     * ^XA
     * ^LT-30
     * ^FO010,010,0^BY3
     * ^BEN,70,Y,N
     * ^FD99123456^FS
     * ^XZ
     */

    public function writeEan13($code) {
        if (strlen($code)>12) throw new Exception("wrong code lenght: >12");
        // set offset
        $this->zpl_buffer .= "^FO010,010,0\n";
        // codebar scale
        $this->zpl_buffer .= "^BY3\n";
        // ean-13 specific settings
        $this->zpl_buffer .= "^BEN,70,Y,N\n";
        // the code max 12
        $this->zpl_buffer .= "^FD".$code."^FS\n";
    }

    public function commit() {
      $this->zpl_buffer .= "^XZ";
      return $this->zpl_buffer;
    }
}
?>
