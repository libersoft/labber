<?php

/**
 * Matrix actions.
 *
 * @package    lsLabberPlugin
 * @subpackage lsLabberMatrix
 * @author     LiberSoft <info@libersoft.it>
 * @extdirect-action matrix
 */
class lsLabberMatrixActions extends sfActions
{
  public function executeCopyParent()
  {
    $mms = Doctrine::getTable('MatrixMatrix')->findAll();
    $matrixTable = Doctrine::getTable('Matrix');

    foreach ($mms as $mm)
    {
      $m = $matrixTable->find($mm->matrix_id);
      $m->set('parent_id', $mm->parent_matrix_id);
      $m->save();
    }
    return sfView::NONE;
  }

  /**
   * Recupera le matrici radice per un laboratorio
   *
   * @extdirect-enable
   * @extdirect-len 3
   */
  public function executeGetRootMatrices(sfWebRequest $request)
  {
    $data = $request->getParameter('_raw');
    $class = $data[1];
    $recordId = $data[2];

    $rootMatrices = MatrixTable::getRoots();

    $this->result = $this->hydrateMatrices($rootMatrices, $class, $recordId);
    return sfView::SUCCESS;
  }

  /**
   * Ritorna i figli di una Matrix per un TreePanel asynchronous
   *
   * @extdirect-enable
   * @extdirect-len 3
   */
  public function executeGetChildren(sfWebRequest $request)
  {
    $data = $request->getParameter('_raw');
    $parentId = $data[0];
    $class = $data[1];
    $recordId = $data[2];

    $matrix = Doctrine::getTable('Matrix')->find($parentId);
    $children = $matrix->getSubmatrices();

    $this->result = $this->hydrateMatrices($children, $class, $recordId);
    return sfView::SUCCESS;
  }

  private function hydrateMatrices($collection, $class = null, $recordId = null)
  {
    $results = array();

    foreach ($collection as $child)
    {
      $node['id'] = $child->id;
      if ($child->unconfirmed)
      {
        $node['name'] = $child->name . ' <i>(da confermare)</i>';
        $node['text'] = $child->name . ' <i>(da confermare)</i>';
      }
      else
      {
        $node['name'] = $child->name;
        $node['text'] = $child->name;
      }
      $node['description'] = $child->description;
      $node['methods'] = $child->getAssociatedMethods();
      $node['updated_at'] = $child->updated_at;
      $node['department_id'] = $child->department_id;

      if (!$child->hasChildren())
      {
        $node['children'] = array();
        $node['expanded'] = true;
      }

      if ($class != null)
      {
        // check sulle matrici collegate a questo oggetto
        $checkedIds = Doctrine::getTable($class)
          ->find($recordId)
          ->getMatrices()
          ->getPrimaryKeys();

        $node['checked'] = in_array($child->id, $checkedIds);
      }

      $results[] = $node;

      unset($node['children'], $node['expanded']);
    }
    return $results;
  }

  /**
   * Recupera id e name delle matrici con un array children delle figlie
   * (per il ControlsPanel)
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeGetWithDescendants(sfWebRequest $request)
  {
    $query = Doctrine_Query::create()
      ->from('Matrix m')
      ->leftJoin('m.DeterminationType');

    foreach ($request->getParameter('doctrineWhereIns') as $whereIn)
    {
      $query->whereIn('m.' . $whereIn->field, $whereIn->valueSet);
    }

    if ($request->hasParameter('query') && $request->getParameter('query') != '')
    {
      $query->andWhere('m.name REGEXP ?', $request->getParameter('query'));
    }

    if ($request->hasParameter('groupMatrixId') && $request->getParameter('groupMatrixId') != '')
    {
      $rootMatrix = Doctrine::getTable('Matrix')->find($request->getParameter('groupMatrixId'));
      $tree = $rootMatrix->getChildIds();
      $query->andWhereIn('m.id', $tree);
    }

    $query->orderBy('m.name');

    $this->result = array('data' => $this->populateResults($query->execute()), 'success' => true);
    return sfView::SUCCESS;
  }

  private function populateResults($collection)
  {
    $results = array();
    foreach ($collection as $matrix)
    {
      $record = array();
      $record['id'] = $matrix->id;
      $record['name'] = $matrix->name;

      $results[] = $record;
    }
    return $results;
  }

  /**
   * Aggiorna la parentela con le altre Matrix
   *
   * @extdirect-enable
   * @extdirect-len 2
   */
  public function executeUpdateParent()
  {
    $matrixId = $this->getRequestParameter('matrixId');
    $parentMatrixId = $this->getRequestParameter('newParentId');

    $matrix = Doctrine::getTable('Matrix')->find($matrixId);
    $matrix->set('parent_id', $parentMatrixId);
    $matrix->save();

    $this->result = array('success' => true);
    return sfView::SUCCESS;
  }

  /**
   * LIKE A BOSS
   *
   * @extdirect-enable
   * @extdirect-len 1
   */
  public function executeReload()
  {
    $this->result = array(
      'success' => true
    );
    return sfView::SUCCESS;
  }
}
