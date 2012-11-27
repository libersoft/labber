<?php

/**
 * DeterminationType actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberDeterminationType
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action determinationType
 */
class lsLabberDeterminationTypeActions extends sfActions
{
  /**
   * Lista delle determination dalla tabella di cache
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeList(sfWebRequest $request)
  {
    $limit = $request->getParameter('limit', 15);
    $page = ($request->getParameter('start', 0)/$limit)+1;
    $dir = $request->getParameter('dir', 'ASC');
    $column = $request->getParameter('sort', 'Denomination');

    $q = Doctrine_Query::create()
      ->from('DeterminationType dt')
      ->leftJoin('dt.Method Method')
      ->leftJoin('Method.Fields')
      ->leftJoin('dt.Matrix Matrix')
      ->leftJoin('dt.Denomination Denomination')
      ->leftJoin('dt.SIPrefix')
      ->leftJoin('dt.UnitOfMeasurement')
      ->leftJoin('dt.Constants.MethodConstant');

    try
    {
      # conditions for sorting
      if (Doctrine::getTable('DeterminationType')->hasColumn($column))
      {
        $q->orderBy(sprintf('dt.%s %s', Doctrine::getTable('DeterminationType')->getFieldName($column), $dir));
      }
      else
      {
        // questa filtra per Denomination.name, Matrix.name, Method.name
        $q->orderBy(sprintf('%s.name %s', $column, $dir));
      }

      # per la FilteringToolbar
      if ($request->hasParameter('filters'))
      {
        $filters = $request->getParameter('filters');
        foreach ($filters as $filter)
        {
          switch ($filter->field)
          {
            case 'matrix_id':
              // filtra per le sottomatrici
              $ids = Doctrine::getTable('Matrix')->find($filter->value)->getChildIds();
              $ids[] = $filter->value;  // aggiungi la matrice stessa
              $q->andWhereIn('matrix_id', $ids);
              break;
            case 'submatrix_id':
              // limita il filtro al percorso matrix <-> submatrix
              $ids = Doctrine::getTable('Matrix')->find($filter->value)->getParentIds();
              $ids[] = $filter->value;  // aggiungi la matrice stessa
              $q->andWhereIn('matrix_id', $ids);
              break;
            default:
              $q->andWhere(sprintf('%s %s ?', $filter->field, $filter->operator), $filter->value);
          }
        }
      }

      # object responsible for paging
      $pager = new sfDoctrinePager('DeterminationType', $limit);

      $pager->setQuery($q);
      $pager->setPage($page);
      $pager->init();

      $data = array();

       # format result array
      foreach ($pager->getResults() as $dt)
      {
        $dType = array();
        $dType['id'] = $dt->id;
        $dType['MethodFields'] = $dt->getMethod()->getFields()->toArray();
        $dType['Denomination'] = $dt->getDenomination()->name;
        $dType['Method'] = $dt->getMethod()->name;
        $dType['Matrix'] = $dt->getMatrix()->name;
        $dType['denomination_id'] = $dt->denomination_id;
        $dType['method_id'] = $dt->method_id;
        $dType['matrix_id'] = $dt->matrix_id;
        $dType['um'] = $dt->getSIPrefix()->prefix . $dt->getUnitOfMeasurement()->symbol;
        $dType['is_default'] = $dt->is_default;
        $dType['is_sinal'] = $dt->is_sinal;
        $dType['significant_digits'] = $dt->significant_digits;
        $dType['max_decimal_digits'] = $dt->max_decimal_digits;
        $dType['scale_id'] = $dt->scale_id;
        $dType['um_id'] = $dt->um_id;
        $dType['price'] = $dt->price;

        $constants = array();
        foreach ($dt->getConstants() as $constant)
        {
          $constants[$constant->MethodConstant->slug] = $constant->value;
        }
        $dType['constants'] = json_encode($constants);

        $dType['lab'] = $dt->getMethod()->getUnit()->name;

        $data[] = $dType;
      }

      $this->result = array(
        'success' => true,
        'data'    => $data,
        'total'   => $pager->getNbResults()
      );
    }
    catch (Exception $exc)
    {
      $this->result = array(
        'success' => false,
        'message' => $exc->getMessage()
      );
    }

    return sfView::SUCCESS;
  }
}