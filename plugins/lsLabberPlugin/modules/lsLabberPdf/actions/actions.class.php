<?php

/**
 * pdf actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberPdf
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action pdf
 */
class lsLabberPdfActions extends sfActions
{
     /**
   * @extdirect-enable
   * @extdirect-len 1
   * @return <type>
   */
     public function executeReport(sfWebRequest $request)
   {
//      $sample_id = $request->getParameter('sample_id');
      $sample_id = $_GET['id'];
      $config = sfTCPDFPluginConfigHandler::loadConfig();
      // pdf object
      $pdf = new sfTCPDF();
      // settings
      $pdf->SetFont("FreeSerif", "", 12);
      $pdf->SetMargins(PDF_MARGIN_LEFT, PDF_MARGIN_TOP, PDF_MARGIN_RIGHT);
      $pdf->setHeaderFont(array(PDF_FONT_NAME_MAIN, '', PDF_FONT_SIZE_MAIN));
      $pdf->SetHeaderData('', PDF_HEADER_LOGO_WIDTH, 'pH s.r.l.','n° 0069');
      $pdf->setFooterFont(array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));
      $pdf->SetHeaderMargin(PDF_MARGIN_HEADER);
      $pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

      // init pdf doc
      $pdf->AliasNbPages();
      $pdf->AddPage();

      $sample = Doctrine::getTable('Sample')->find($sample_id);
      $det = $sample->getDeterminations();
      $order = $sample->getOrder();
      $customer = $order->getCustomer();

      $data_ritiro = new DateTime($sample->getDataRitiro());

      $pdf->Cell(0, 0, 'N° XXXXXXX', '', 1, 'R');
      $pdf->Cell(0, 10, '', '', 1);
      $pdf->Cell(60, 5, 'Numero di identificazione', '', 0);
      $pdf->Cell(60, 5, 'XXXXXXX', '', 1);
      $pdf->Cell(60, 5, 'Descrizione del campione', '', 0);
      $pdf->Cell(60, 5,  $sample->getDescrizione(), '', 1);
      $pdf->Cell(60, 5, 'Campionamento effettuato da', '', 0);
      $pdf->Cell(60, 5,  $sample->getAcuradi(), '', 1);
      $pdf->Cell(60, 5, 'Richiedente', '', 0);
      $pdf->Cell(60, 5,  $customer->getName(), '', 1);
      $pdf->Cell(60, 5, 'Data arrivo campione', '', 0);
      $pdf->Cell(60, 5,  $data_ritiro->format('d/m/Y'), '', 1);

      $pdf->Cell(0, 10, '', '', 1, 'C');
      $pdf->Cell(0, 0, 'ESITO D\'ESAME', '', 1, 'C');
      $pdf->SetFontSize(7);

      $pdf->Cell(45, 0, 'Determinazione', 'LTB', 0);
      $pdf->Cell(12, 0, 'Risultato', 'TB', 0);
      $pdf->Cell(15, 0, 'u.m.', 'TB', 0);
      $pdf->Cell(10, 0, 'LOQ', 'TB', 0);
      $pdf->Cell(10, 0, 'LOD', 'TB', 0);
      $pdf->Cell(45, 0, 'Metodo', 'TB', 0);
      $pdf->Cell(6, 0, 'Note', 'TB', 0);
      $pdf->Cell(8, 0, 'Inizio', 'TB', 0);
      $pdf->Cell(8, 0, 'Fine', 'RTB', 1);
    //  $idpage=2;
      $i=0;
      foreach($det as $determ){
          if($determ->data_inizio!=null & $determ->data_fine!=null){
               $datei = new DateTime($determ->data_inizio);
               $datef = new DateTime($determ->data_fine);
          }
          $den = $determ->getDenomination();
          $met = $determ->getMethod();
          $um = $determ->getUnitOfMeasurement();
          $params = $determ->getParams();
          $loq = strstr($params,'LOQ');
          $tokq = strtok($loq, ':');
          $tokq = strtok('"');

          $lod = strstr($params,'LOD');
          $tokd = strtok($lod, ':');
          $tokd = strtok('"');

          $pdf->Cell(45, 0, $den->name, 'LBTR', 0);
          $pdf->Cell(12, 0, $determ->risultato_formattato, 'LBTR', 0);
          $pdf->Cell(15, 0, $um->symbol, 'LTBR', 0);
          $pdf->Cell(10, 0, $tokq, 'LTBR', 0);
          $pdf->Cell(10, 0, $tokd, 'LTBR', 0);
          $pdf->Cell(45, 0, $met->sinal_name, 'LTBR', 0);
          if($determ->nota_report!=null){
              $pdf->Cell(6, 0, $i+1, 'LTBR', 0, 'C');
              $note[$i]=$determ->nota_report;
              $i++;
          }
          else {
              $pdf->Cell(6, 0, '', 'LTBR', 0);
          }
          if($determ->data_inizio!=null & $determ->data_fine!=null){
              $pdf->Cell(8, 0, $datei->format('d/m'), 'LTBR', 0);
              $pdf->Cell(8, 0, $datef->format('d/m'), 'LTBR', 1);
          }
          else {
              $pdf->Cell(8, 0, '', 'LTBR', 0);
              $pdf->Cell(8, 0, '', 'LTBR', 1);
          }
       
      }
      $pdf->Cell(0, 5, '', '', 1);
      $pdf->Cell(0, 2, 'Note:', '', 1);
      $i=1;
      foreach($note as $not){
         $pdf->Cell(3, 2, '('.$i.')', '', 0);
         $pdf->Cell(0, 2, ' '.$not, '', 1);
         $i++;

      }   
       // output

      $pdf->Output('report-'.$sample->getNumero().'.pdf', 'D');
//      return sfView::SUCCESS;
        return sfView::NONE;
    }  
}
