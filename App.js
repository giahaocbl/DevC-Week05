import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Linking
} from "react-native";
import moment from "moment";
import { Card, Button, Icon } from "react-native-elements";

const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      data: [],
      pageNumber: 1,
      apiError: false,
      lastPageReached: false
    };
  }

  getNews = async () => {
//    this.setState({loading: true});
    try {
      const response = await fetch(
        "https://newsapi.org/v2/top-headlines?country=us&apiKey=0d425e30a62a4379a6cded99e6aa3c93"
      );
      const jsonData = await response.json();
      const hasMoreArticles = jsonData.articles.length > 0;
      if (hasMoreArticles) {
        const newArticleList = filterForUniqueArticles(
          this.state.data.concat(jsonData.articles)
        );
        this.setState({ data: newArticleList, pageNumber: this.state.pageNumber + 1});
      }
      else {
        this.setState({lastPageReached: true});
      }
    } catch (error) {
      this.setState({apiError: true});
    }
    this.setState({loading: false});
    console.log(this.state.data);
    console.log(this.state.loading);
  };

  componentDidMount = () => {
    // const response = await fetch(    'https://newsapi.org/v2/top-headlines?country=us&apiKey=6eec2f7fe6cd4c40a3fef8f33f5778fe'
    // );
    // const jsonData = await response.json();
    // if (jsonData.status!=="ok"){
    //   alert("ERROR");
    // }
    // else{
    //   this.setState({data: jsonData.articles});
    //   console.log(jsonData.articles);
    //   console.log("data", this.state.data);
    // }

    this.getNews.call();
  };

  onPress = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };

  renderItem = ({ item }) => {
    return (
      <Card title={item.title} image={{ uri: item.urlToImage }}>
        <View style={styles.row}>
          <Text style={styles.label}>Source</Text>
          <Text style={styles.info}>{item.source.name}</Text>
        </View>
        <Text style={{ marginBottom: 10 }}>{item.content}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Published</Text>
          <Text style={styles.info}>
            {moment(item.publishedAt).format("LLL")}
          </Text>
        </View>
        <Button icon={<Icon />} title="Read more" backgroundColor="#03A9F4" onPress={() => this.onPress(item.url)} />
      </Card>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" loading={this.state.loading} />
        </View>
      );
    }
    if (this.state.apiError) {
      return (
        <View style = {styles.container}>
          <Text>ERROR</Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>Articles Count:</Text>
          <Text style={styles.info}>{this.state.data.length}</Text>
        </View>
        <FlatList
          data={this.state.data}
          renderItem={this.renderItem}
          keyExtractor={item => item.title}
          onEndReached={this.getNews}
          onEndReachedThreshold={1}
          ListFooterComponent={this.state.lastPageReached === true ? <Text>No more articles</Text> : <ActivityIndicator size="large" loading={this.state.loading} />}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerFlex: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: "center",
    backgroundColor: "#fff",
    justifyContent: "center"
  },
  header: {
    height: 30,
    width: "100%",
    backgroundColor: "pink"
  },
  row: {
    flexDirection: "row"
  },
  label: {
    fontSize: 16,
    color: "black",
    marginRight: 10,
    fontWeight: "bold"
  },
  info: {
    fontSize: 16,
    color: "grey"
  }
});
