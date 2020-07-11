// calculate generalized price equation stats of a given genealogy's graph,
// for a specific trait
class GPE_Analysis {
  constructor(genealogy, traitset, ancestor_level, trait_alt) {
    this.genealogy = genealogy;
    this.traitset = traitset;
    this.ancestor_level = ancestor_level;
    this.descendant_level = ancestor_level + 1;
  }

  get_ancestor_node_ids() {
    return this.genealogy.get_level_node_ids(this.ancestor_level);
  }

  get_descendant_node_ids() {
    return this.genealogy.get_level_node_ids(this.descendant_level);
  }

  // tests connection between ancestor/descendant pair
  // C(a,d) = 1 if a -> d
  // C(a,d) = 0 otherwise
  C(ancestor_id, descendant_id) {
    if (this.genealogy.exists_edge(ancestor_id, descendant_id))
    { return 1; }
    else
    { return 0; }
  }

  // Connections from single ancestor to all descendants
  C_ancestor(ancestor_id) {
    let descendant_level = this.genealogy.get_level(ancestor_id) + 1;
    let total = 0;
    this.genealogy.get_edges_from(ancestor_id).forEach((edge) => {
      if (this.genealogy.get_level(edge.target) == descendant_level)
      { total += 1; }
    });
    return total;
  }

  // Connections from all ancestors to single descendant
  C_descendant(descendant_id) {
    let total = 0;
    this.genealogy.get_edges_from(descendant_id).forEach((edge) => {
      if (this.genealogy.get_level(edge.source) == this.ancestor_level)
      { total += 1; }
    });
    return total;
  }

  // Connections from all ancestors to all descendants
  C_all() {
    let total = 0;
    this.get_ancestor_node_ids().forEach((ancestor_id) => {
      this.genealogy.get_edges_from(ancestor_id).forEach((edge) => {
        if (this.genealogy.get_level(edge.target) == this.descendant_level)
        { total += 1; }
      });
    });
    return total;
  }

  test_trait(node_id) {

  }

  // tests whether node has this.trait
  X(node_id) {
    for (var i = 0; i < this.traitset.length; i++) {
      let trait = this.traitset[i];
      if (trait_equal(this.genealogy.get_node_metadata(node_id).trait, trait))
      { return 1; }
    }
    return 0;
  }

  // Xbar of given level
  // i.e. average X of nodes in given level
  Xbar(level) {
    let node_ids = this.genealogy.get_level_node_ids(level);
    let total = 0;
    node_ids.forEach(node_id => total += this.X(node_id));
    return total/node_ids.length;
  }

  // Xbar for ancestor level
  Xbar_ancestors() {
    return this.Xbar(this.ancestor_level);
  }

  // Xbar for descendant level
  Xbar_descendants() {
    return this.Xbar(this.descendant_level);
  }

  // Simply calculate DXbar as
  // the difference between the Xbar of the ancestor and descendant levels
  DXbar_simple() {
    return (this.Xbar_descendants() - this.Xbar_ancestors());
  }

  DX_ancestor(ancestor_id) {
    let numerator = 0;
    let descendant_ids = this.get_descendant_node_ids();
    descendant_ids.forEach((descendant_id) => {
      numerator += (this.C(ancestor_id, descendant_id) *
                   (this.X(descendant_id)) - this.X(ancestor_id));
    });
    let denomenator = this.C_ancestor(ancestor_id);
    return numerator/denomenator;
  }

  // Change in X value between ancestor and descendant
  // If they are not connected, then 0
  DX(ancestor_id, descendant_id) {
    let C = this.C(ancestor_id, descendant_id);
    let Xa = this.X(ancestor_id);
    let Xd = this.X(descendant_id);
    return C * (Xd - Xa);
  }

  // TODO: is this computed correctly?
  // Ctil from all ancestors to single descendant
  Ctil_descendant(descendant_id) {
    let numerator = this.C_descendant(descendant_id);
    let descendant_count = this.get_descendant_node_ids().length;
    let denomenator = this.C_all() / descendant_count;
    return numerator/denomenator;
  }

  // Ctil from single ancestor to all descendants
  Ctil_ancestor(ancestor_id) {
    let numerator = this.C_ancestor(ancestor_id);
    let ancestor_count = this.get_ancestor_node_ids().length;
    let denomenator = this.C_all() / ancestor_count;
    return numerator/denomenator;
  }

  // cov(Ctil_a, X_a)
  cov_Ctil_X_ancestors() {
    let ancestor_ids = this.get_ancestor_node_ids();

    let Ctil_dict = {};
    let X_dict = {};

    let Ctil_total = 0;
    let X_total = 0;
    ancestor_ids.forEach((ancestor_id) => {
      let Ctil = this.Ctil_ancestor(ancestor_id);
      Ctil_dict[ancestor_id] = Ctil;
      Ctil_total += Ctil;
      let X = this.X(ancestor_id);
      X_dict[ancestor_id] = X;
      X_total += X;
    });
    let Ctil_average = Ctil_total/ancestor_ids.length;
    let X_average = X_total/ancestor_ids.length;

    let cov_Ctil_X_total = 0;
    ancestor_ids.forEach((ancestor_id) => {
      cov_Ctil_X_total += ((Ctil_dict[ancestor_id] - Ctil_average) *
                    (X_dict[ancestor_id] - X_average));
    });
    return cov_Ctil_X_total/ancestor_ids.length;
  }

  // cov(Ctil_d, X_d)
  cov_Ctil_X_descendants() {
    let descendant_ids = this.get_descendant_node_ids();

    let Ctil_dict = {};
    let X_dict = {};

    let Ctil_total = 0;
    let X_total = 0;
    descendant_ids.forEach((descendant_id) => {
      let Ctil = this.Ctil_descendant(descendant_id);
      Ctil_dict[descendant_id] = Ctil;
      Ctil_total += Ctil;
      let X = this.X(descendant_id);
      X_dict[descendant_id] = X;
      X_total += X;
    });
    let Ctil_average = Ctil_total/descendant_ids.length;
    let X_average = X_total/descendant_ids.length;

    let cov_Ctil_X_total = 0;
    descendant_ids.forEach((descendant_id) => {
      cov_Ctil_X_total += ((Ctil_dict[descendant_id] - Ctil_average) *
                    (X_dict[descendant_id] - X_average));
    });
    return cov_Ctil_X_total/descendant_ids.length;
  }

  ave_DX() {
    let ancestor_ids = this.get_ancestor_node_ids();
    let total = 0;
    let count = 0;
    this.get_ancestor_node_ids().forEach((ancestor_id) => {
      this.genealogy.get_children_ids(ancestor_id).forEach((descendant_id) => {
        if (this.genealogy.get_node_metadata(descendant_id).level == this.descendant_level)  {
          total += this.DX(ancestor_id, descendant_id);
          count++;
        }
      });
    });
    return total/count;
  }

  // corresponds to equation (1) in KGS paper
  DXbar_1() {
    // TODO: implement
  }

  // corresponds to equation (2) in KGS paper
  DXbar_2() {
    let cov_a = this.cov_Ctil_X_ancestors();
    let ave_DX = this.ave_DX();
    let cov_d = this.cov_Ctil_X_descendants();
    return cov_a + ave_DX - cov_d;
  }

}
