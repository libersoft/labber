<?php

/**
 * sampleType actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberSampleType
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action sampleType
 */
class lsLabberSampleTypeActions extends sfActions
{
 /**
  * Executes index action
  *
  * @extdirect-enable
  * @extdirect-len 2
  */
  public function executeUpdateMatrices()
  {
    $sampleTypeId = $this->getRequestParameter('sampleTypeId');
    $matrixIds = $this->getRequestParameter('matrixIds');

    // Rimuovo le eventuali parentele presenti
    Doctrine_Query::create()
      ->delete()
      ->from('MatrixSampleType')
      ->andWhere('sample_type_id = ?', $sampleTypeId)
      ->execute();

    foreach ($matrixIds as $matrixId)
    {
      $mst = new MatrixSampleType();
      $mst->set('sample_type_id', $sampleTypeId);
      $mst->set('matrix_id', $matrixId);
      $mst->save();
    }
    
    $this->result = array('success' => true);
    return sfView::SUCCESS;
  }

    /**
   * Copia le Determination di una OfferSection in un Sample
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeGetMatrix(sfWebRequest $request)
  {
    $sample_type_id = $request->getParameter('sample_type_id');
    try
    {
      $q = Doctrine_Query::create()
      ->select('mst.matrix_id')
      ->from(' MatrixSampleType mst')
      ->where('mst.sample_type_id = ?', $sample_type_id);

      $matrices = $q->fetchArray();
      $i=0;
      foreach($matrices as $m) {
          $matrice[$i] = $m['matrix_id'];
          $i++;
      }
      $result = array(
        'success' => true,
        'message' => 'Controlli inseriti correttamente.',
        'matrices'     => $matrice
      );
    }
    catch (Exception $exc)
    {
      $result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }
    $this->result = $result;
    return sfView::SUCCESS;
  }
}
