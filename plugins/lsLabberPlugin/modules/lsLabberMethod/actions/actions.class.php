<?php

/**
 * method actions
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberMethod
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action method
 */
class lsLabberMethodActions extends sfActions
{
  /**
   * Copia una regola di un metodo
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeCopyRule(sfWebRequest $request)
  {
    try
    {
      $id = $request->getParameter('record_id');

      $rule = Doctrine::getTable('MethodRule')->find($id);
      $newRule = $rule->copy();
      $newRule->save();

      $result = array(
        'success' => true,
        'message' => 'Regola copiata'
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

  /**
   * Copia un metodo
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeCopy(sfWebRequest $request)
  {
    $data = $request->getParameter('data');
    $associations = (array) $data->associations;

    $sourceMethod = Doctrine::getTable('Method')->find($data->sourceMethodId);

    if (in_array('data', $associations))
    {
      $newMethod = $sourceMethod->copy();
    }
    else
    {
      $newMethod = new Method();
      $newMethod->department_id = $sourceMethod->department_id;
      $newMethod->organization_id = $sourceMethod->organization_id;
      $newMethod->unit_id = $sourceMethod->unit_id;
    }
    $newMethod->name = $data->name;
    $newMethod->unconfirmed = true;
    $newMethod->save();

    try
    {
      foreach ($associations as $association)
      {
        switch ($association)
        {
          case 'denominations':
            $denominationIDs = $sourceMethod->getDenominations()->getPrimaryKeys();
            foreach ($denominationIDs as $denominationID)
            {
              $md = new MethodDenomination();
              $md->denomination_id = $denominationID;
              $md->method_id = $newMethod->id;
              $md->save();
            }
            break;
          case 'matrices':
            $mms = Doctrine_Query::create()
                ->from('MethodMatrix mm')
                ->select('mm.matrix_id')
                ->where('mm.method_id = ?', $sourceMethod->id)
                ->fetchArray();

            foreach ($mms as $mm)
            {
              $md = new MethodMatrix();
              $md->matrix_id = $mm['matrix_id'];
              $md->method_id = $newMethod->id;
              $md->save();
            }
            break;
          case 'units':
            $mus = Doctrine_Query::create()
              ->from('MethodUnitOfMeasurement mu')
              ->where('mu.method_id = ?', $sourceMethod->id);

            foreach ($mus->execute() as $mu)
            {
              if (!$mu->is_default)
              {
                $newMu = $mu->copy();
                $newMu->method_id = $newMethod->id;
                $newMu->save();
              }
            }
            break;
          case 'parameters':
            $mfs = Doctrine_Query::create()
              ->from('MethodField mf')
              ->where('mf.method_id = ?', $sourceMethod->id);

            foreach ($mfs->execute() as $mf)
            {
              $newMf = $mf->copy();
              $newMf->method_id = $newMethod->id;
              $newMf->save();
            }
            break;
          case 'constants':
            $mmcs = Doctrine_Query::create()
              ->from('MethodMethodConstant mmc')
              ->where('mmc.method_id = ?', $sourceMethod->id);

            foreach ($mmcs->execute() as $mmc)
            {
              $newMmc = $mmc->copy();
              $newMmc->method_id = $newMethod->id;
              $newMmc->save();
            }
            break;
          default:
            break;
        }
      }
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    $this->result = array('success' => true);
    return sfView::SUCCESS;
  }
  /**
   * Rimuove un MethodMatrix
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeRemoveMatrix(sfWebRequest $request)
  {
    $data = $request->getParameter('data');

    $q = Doctrine_Query::create()
      ->delete()
      ->from('MethodMatrix')
      ->where('method_id = ?', $data->method_id)
      ->andWhere('matrix_id = ?', $data->matrix_id);

    $this->result = array('success' => $q->execute());
    return sfView::SUCCESS;
  }

  /**
   * Ottieni il __toString() per la doctrineClass sugli ID inviati
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeGetRules(sfWebRequest $request)
  {
    try
    {
      if (!$methodId = $request->getParameter('methodId'))
      {
        throw new Exception('Missing \'methodId\' parameter');
      }

      $q = Doctrine_Query::create()
        ->from('MethodRule')
        ->where('method_id = ?', $methodId);

      $data = array();
      foreach ($q->execute() as $methodRule)
      {
        $rule = array();

        // gli attributi così come salvati nel db
        $rule['id'] = $methodRule->id;
        $rule['method_id'] = $methodRule->method_id;
        $rule['denomination_ids'] = $methodRule->denomination_ids;
        $rule['matrix_ids'] = $methodRule->matrix_ids;
        $rule['action'] = $methodRule->action;
        $rule['value'] = $methodRule->value;

        // matrici
        if ($methodRule->matrix_ids != '"all"')
        {
          $rule['matrices'] = array();
          foreach (json_decode($methodRule->matrix_ids) as $matrixId)
          {
            $rule['matrices'][] = Doctrine::getTable('Matrix')->find($matrixId)->name;
          }
        }
        else
        {
          $rule['matrices'] = $methodRule->matrix_ids;
        }

        // denominazioni
        if ($methodRule->denomination_ids != '"all"')
        {
          $rule['denominations'] = array();
          foreach (json_decode($methodRule->denomination_ids) as $denominationId)
          {
            $rule['denominations'][] = Doctrine::getTable('Denomination')->find($denominationId)->name;
          }
        }
        else
        {
          $rule['denominations'] = $methodRule->denomination_ids;
        }

        // regola
        $value = json_decode($methodRule->value, true);
        switch ($methodRule->action)
        {
          case 'set-default':
            $rule['rule'] = 'Marca questo metodo come <b>metodo preferito</b>.';
            break;
          case 'set-certified':
            $rule['rule'] = 'Marca come <b>accreditato Accredia</b>.';
            break;
          case 'set-formula':
            $rule['rule'] = 'Assegna la formula (link alla <b>formula ' . $value .'</b>).';
            break;
          case 'set-price':
            $rule['rule'] = 'Imposta il <b>costo</b> a ' . str_replace('.', ',', $value) . ' €';
            break;
          case 'set-default-value':
            $rule['rule'] = 'Assegna al parametro "<b>' . Doctrine::getTable('FieldType')->find($value['field-id']) . '</b>" il valore di default "<b>'. $value['field-value']. '</b>".';
            break;
          case 'set-field-values':
            $rule['rule'] = array();
            $rule['rule'][] = 'Assegna al parametro "<b>' . Doctrine::getTable('FieldType')->find($value['field-id']) . '</b>" i seguenti valori ammissibili:';
            foreach ($value['field-values'] as $fieldValue)
            {
              $rule['rule'][] = '<br/>&bull; <b>' . $fieldValue . '</b>';
            }
            break;
          case 'disable':
            $rule['rule'] = 'Marca come <b>disabilitato</b>.';
            break;
          case 'set-constant-value':
            $rule['rule'] = 'Assegna alla costante "<b>' . Doctrine::getTable('MethodConstant')->find($value['constant-id']) . '</b>" il valore: "<b>' . $value['constant-value'] . '</b>"';
            break;
          case 'change-um':
            $rule['rule'] = array();
            $rule['rule'][] = 'Cambia l\'<b>unità di misura</b>:';
            $rule['rule'][] = '<br/>&bull; Scala: "<b>' . Doctrine::getTable('SIPrefix')->find($value['si-prefix-id']) . '</b>"';
            $rule['rule'][] = '<br/>&bull; Unità di  misura: "<b>' . Doctrine::getTable('UnitOfMeasurement')->find($value['um-id']) . '</b>"';
            $rule['rule'][] = '<br/>&bull; Cifre <b>decimali</b>: <b>' . $value['max-decimal-digits'] . '</b>';
            $rule['rule'][] = '<br/>&bull; Cifre <b>significative</b>: <b>' . $value['significant-digits'] . '</b>';
            array_key_exists('loq', $value) && $value['loq'] !== '' && $rule['rule'][] = '<br/>&bull; <b>LOQ</b>: <b>' . $value['loq'] . '</b>';
            array_key_exists('lod', $value) && $value['lod'] !== '' && $rule['rule'][] = '<br/>&bull; <b>LOD</b>: <b>' . $value['lod'] . '</b>';
            break;
          case 'set-uncertainty-recovery':
            $rule['rule'] = 'Valori multipli di <b>incertezza</b> e <b>recupero</b>.';
            break;
          case 'multiset':
            $rule['rule'] = 'Configurazione';
            break;
        }
        $data[] = $rule;
      }

      $result = array(
        'success' => true,
        'data' => $data
      );
    }
    catch (Exception $e)
    {
      $result = array(
        'success' => false,
        'message' => $e->getMessage(),
        'file'    => $e->getFile(),
        'line'    => $e->getLine(),
        'trace'   => $e->getTrace()
      );
    }
    $this->result = $result;
    return sfView::SUCCESS;
  }

  /**
   * Carica un allegato nel db
   *
   *  @extdirect-enable
   *  @extdirect-len 1
   */
  public function executeFileRegister()
  {
    $descrizione = $this->getRequestParameter('descrizione');
    $filename = $this->getRequestParameter('filename');
    
    /* qui devo salvare il file nel database */    
    $handle = fopen('/tmp/aa','a');
    fwrite($handle,"$descrizione con nome $filename\n");
    fclose($handle);
    
    $this->result = array('success' => true);
    return sfView::SUCCESS;
  }

  /**
   * Associa tutte le denominazioni di un metodo
   *
   *  @extdirect-enable
   *  @extdirect-len 1
   */
  public function executeDenominationFromMethod()
  {
    /* Il metodo che stò manipolando */
    $currentId = $this->getRequestParameter('method_current');
    /* Il metodo da cui prendo le denominazioni */
    $fromId = $this->getRequestParameter('method_from');

    $destination = Doctrine::getTable('Method')->find($currentId);
    $origin = Doctrine::getTable('Method')->find($fromId);

    $existingDenominations = $destination->getDenominations()->getPrimaryKeys();
    $newDenominations = $origin->getDenominations()->getPrimaryKeys();

    foreach ($newDenominations as $denominationId)
    {
      if (!in_array($denominationId, $existingDenominations))
      {
        $md = new MethodDenomination();
        $md->set('method_id', $currentId);
        $md->set('denomination_id', $denominationId);
        $md->save();
      }
    }
    
    $this->result = array(
      'success' => true,
    );
    return sfView::SUCCESS;
  }

  /**
   *  Script di generazione di tipi di controllo dalle regole
   *
   *  @extdirect-enable
   *  @extdirect-len 1
   */
  public function executeUpdateDeterminationTypes(sfWebRequest $request)
  {
    $methodId = $request->getParameter('methodId');
    $method = Doctrine::getTable('Method')->find($methodId);

    $method->updateDeterminationTypes();

    $this->result = array('success' => true);
    return sfView::SUCCESS;
  }

  /**
   * Ricerco le determinationType esistenti per un metodo
   *
   *  @extdirect-enable
   *  @extdirect-len 1
   */
  public function executeGetDeterminationType(sfWebRequest $request)
  {
    $id = $request->getParameter('id');
    $matrix = $request->getParameter('matrix');
    if ($matrix == null)
    {
      $q = Doctrine_Query::create()->select('dt.*, d.*')
          ->from('DeterminationType dt')
          ->leftJoin('dt.Denomination d ON dt.denomination_id = d.id')
          ->where('dt.method_id = ?', $id)
          ->groupBy('dt.denomination_id');

      $dt = $q->fetchArray();
    }
    else
    {
      $q = Doctrine_Query::create()->select('dt.*, d.*')
          ->from('DeterminationType dt')
          ->leftJoin('dt.Denomination d ON dt.denomination_id = d.id')
          ->where('dt.method_id = ? AND dt.matrix_id = ?', array($id, $matrix));
      $dt = $q->fetchArray();
    }
    $result = array(
      'success' => true,
      'data' => $dt
    );
    $this->result = $result;
    return sfView::SUCCESS;
  }
}
